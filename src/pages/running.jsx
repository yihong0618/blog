import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import ReactMapGL, { Source, Layer } from 'react-map-gl';
import { ViewportProvider, useDimensions } from 'react-viewport-utils';

import Layout from '../components/layout';
import { activities } from '../static/activities';
import GitHubSvg from '../../assets/github.svg';
import GridSvg from '../../assets/grid.svg';
import {
  titleForShow, formatPace, scrollToMap, locationForRun, intComma, geoJsonForRuns, geoJsonForMap, titleForRun, filterAndSortRuns, sortDateFunc, sortDateFuncReverse,
} from '../utils/utils';
import {
  MAPBOX_TOKEN, SHENYANG_YEARS_ARR, DALIAN_STRAT_POINT, SHENYANG_START_POINT,
} from '../utils/const';

import styles from './running.module.scss';

const cities = {};
let provinces = [];
let countries = [];
let yearsArr = [];

// generate base attr
((runs) => {
  const locationsList = [];
  runs.forEach(
    (run) => {
      const location = locationForRun(run);
      locationsList.push(location);
      const { city, province, country } = location;
      // drop only one char city
      if (city.length > 1) {
        cities[city] = (cities[city] === undefined ? run.distance : cities[city] + run.distance);
      }
      if (province) {
        provinces.push(province);
      }
      if (country) {
        countries.push(country);
      }
      const y = run.start_date_local.slice(0, 4);
      yearsArr.push(y);
    },
  );
  yearsArr = [...new Set(yearsArr)].sort().reverse();
  provinces = [...new Set(provinces)];
  countries = [...new Set(countries)];
})(activities);

// Page
export default () => {
  const thisYear = yearsArr[0];
  const [year, setYear] = useState(thisYear);
  let onStartPoint = SHENYANG_YEARS_ARR.includes(year)
    ? SHENYANG_START_POINT
    : DALIAN_STRAT_POINT;
  const [runs, setActivity] = useState(filterAndSortRuns(activities, year, sortDateFunc));
  const [title, setTitle] = useState('');
  const [viewport, setViewport] = useState({
    width: '100%',
    height: 400,
    latitude: onStartPoint[0],
    longitude: onStartPoint[1],
    zoom: 11.5,
  });
  const [geoData, setGeoData] = useState(
    geoJsonForRuns(runs),
  );
  const changeYear = (year) => {
    setYear(year);
    onStartPoint = SHENYANG_YEARS_ARR.includes(year)
      ? SHENYANG_START_POINT
      : DALIAN_STRAT_POINT;
    scrollToMap();
    if (year !== 'Total') {
      setActivity(filterAndSortRuns(activities, year, sortDateFunc));
    } else {
      setActivity(activities);
    }
    if (viewport.zoom > 3) {
      setViewport({
        width: '100%',
        height: 400,
        latitude: onStartPoint[0],
        longitude: onStartPoint[1],
        zoom: 11.5,
      });
    }
    setTitle(`${year} Running Heatmap`);
  };

  const locateActivity = (run) => {
    setGeoData(geoJsonForRuns([run]));
    setTitle(titleForShow(run));
  };

  useEffect(() => {
    setGeoData(geoJsonForRuns(runs));
  }, [year]);

  useEffect(() => {
    let startPoint;
    const featuresLength = geoData.features.length;
    const { coordinates } = geoData.features[featuresLength - 1].geometry;
    const isSingleRun = featuresLength === 1;
    if (coordinates.length === 0) {
      startPoint = DALIAN_STRAT_POINT.reverse();
    } else {
      startPoint = coordinates[Math.floor(coordinates.length / 2)];
    }
    setViewport({
      width: '100%',
      height: 400,
      latitude: startPoint[1],
      longitude: startPoint[0],
      // if by year not single run
      zoom: isSingleRun ? 14.5 : 11.5,
    });
    scrollToMap();
  }, [geoData]);

  // TODO refactor
  useEffect(() => {
    let rectArr = document.querySelectorAll('rect');
    if (rectArr.length !== 0) {
      rectArr = Array.from(rectArr).slice(1);
    }

    rectArr.forEach((rect) => {
      const rectColor = rect.getAttribute('fill');
      // not run has no click event
      if (rectColor !== '#444444') {
        const runDate = rect.innerHTML;
        const [runName] = runDate.match(/\d{4}-\d{1,2}-\d{1,2}/) || ['2021'];
        const runLocate = runs.filter(
          (r) => r.start_date_local.slice(0, 10) === runName,
        ).sort((a, b) => b.distance - a.distance)[0];

        // do not add the event next time
        // maybe a better way?
        if (runLocate) {
          rect.onclick = () => locateActivity(runLocate);
        }
      }
    });
    let polylineArr = document.querySelectorAll('polyline');
    if (polylineArr.length !== 0) {
      polylineArr = Array.from(polylineArr).slice(1);
    }
    // add picked runs svg event
    polylineArr.forEach((polyline) => {
      // not run has no click event
      const runDate = polyline.innerHTML;
      const [runName] = runDate.match(/\d{4}-\d{1,2}-\d{1,2}/) || ['2021'];
      const run = runs.filter(
        (r) => r.start_date_local.slice(0, 10) === runName,
      ).sort((a, b) => b.distance - a.distance)[0];

      // do not add the event next time
      // maybe a better way?
      if (run) {
        polyline.onclick = () => locateActivity(run);
      }
    });
  });

  return (
    <>
      <Helmet bodyAttributes={{ class: styles.body }} />
      <Layout>
        <div className="mb5">
          <div className="w-100">
            <h1 className="f1 fw9 i">Running</h1>
          </div>
          {viewport.zoom <= 3 ? <LocationStat runs={activities} location="a" onClick={changeYear} /> : <YearsStat runs={activities} year={year} onClick={changeYear} />}
          <div className="fl w-100 w-70-l">
            {runs.length === 1 ? (
              <RunMapWithViewport
                runs={runs}
                year={year}
                title={title}
                viewport={viewport}
                geoData={geoData}
                setViewport={setViewport}
                changeYear={changeYear}
              />
            ) : (
              <RunMapWithViewport
                runs={runs}
                year={year}
                title={title}
                viewport={viewport}
                geoData={geoData}
                setViewport={setViewport}
                changeYear={changeYear}
              />
            )}
            {year === 'Total' ? <SVGStat />
              : (
                <RunTable
                  runs={runs}
                  year={year}
                  locateActivity={locateActivity}
                  setActivity={setActivity}
                />
              )}
          </div>
        </div>
      </Layout>
    </>
  );
};

const SVGStat = () => (
  <div>
    <GitHubSvg className={styles.runSVG} />
    <GridSvg className={styles.runSVG} />
  </div>
);

// Child components
const YearsStat = ({ runs, year, onClick }) => {
  // make sure the year click on front
  let yearsArrayUpdate = yearsArr.slice();
  yearsArrayUpdate = yearsArrayUpdate.filter((x) => x !== year);
  yearsArrayUpdate.unshift(year);

  // for short solution need to refactor
  return (
    <div className="fl w-100 w-30-l pb5 pr5-l">
      <section className="pb4" style={{ paddingBottom: '0rem' }}>
        <p>
          我用 App 记录自己跑步8年有余，下面列表展示的是
          {year}
          的数据
          <br />
          希望能激励自己前行，不要停下来。这个展示也是我学习React的第一个项目，
          希望自己有所成长。
          <br />
        </p>
      </section>
      <hr color="red" />
      {yearsArrayUpdate.map((year) => (
        <YearStat key={year} runs={runs} year={year} onClick={onClick} />
      ))}
      <YearStat key="Total" runs={runs} year="Total" onClick={onClick} />
    </div>
  );
};

const LocationStat = ({ runs, location, onClick }) => (
  <div className="fl w-100 w-30-l pb5 pr5-l">
    <section className="pb4" style={{ paddingBottom: '0rem' }}>
      <p>
        我跑过了一些地方，希望随着时间的推移，地图点亮的地方越来越多.
        <br />
        不要停下来，不要停下奔跑的脚步.
        <br />
        <br />
        Yesterday you said tomorrow.
      </p>
    </section>
    <hr color="red" />
    <LocationSummary key="locationsSummary" />
    <CitiesStat />
    <YearStat key="Total" runs={runs} year="Total" onClick={onClick} />
  </div>
);

const YearStat = ({ runs, year, onClick }) => {
  if (yearsArr.includes(year)) {
    runs = runs.filter((run) => run.start_date_local.slice(0, 4) === year);
  }
  let sumDistance = 0;
  let streak = 0;
  let pace = 0;
  let paceNullCount = 0;
  let heartRate = 0;
  let heartRateNullCount = 0;
  runs.forEach((run) => {
    sumDistance += run.distance || 0;
    if (run.average_speed) {
      pace += run.average_speed;
    } else {
      paceNullCount++;
    }
    if (run.average_heartrate) {
      heartRate += run.average_heartrate;
    } else {
      heartRateNullCount++;
    }
    if (run.streak) {
      streak = Math.max(streak, run.streak);
    }
  });
  sumDistance = (sumDistance / 1000.0).toFixed(1);
  const avgPace = formatPace(pace / (runs.length - paceNullCount));
  const hasHeartRate = !(heartRate === 0);
  const avgHeartRate = (heartRate / (runs.length - heartRateNullCount)).toFixed(
    0,
  );
  return (
    <div style={{ cursor: 'pointer' }} onClick={() => onClick(year)}>
      <section>
        <Stat value={year} description=" 跑步旅程" />
        <Stat value={runs.length} description=" Runs" />
        <Stat value={sumDistance} description=" KM" />
        <Stat value={avgPace} description=" Avg Pace" />
        <Stat
          value={`${streak} day`}
          description=" Streak"
          className="mb0 pb0"
        />
        {hasHeartRate && (
          <Stat value={avgHeartRate} description=" Avg Heart Rate" />
        )}
      </section>
      <hr color="red" />
    </div>
  );
};

const LocationSummary = () => (
  <div style={{ cursor: 'pointer' }}>
    <section>
      <Stat value={`${yearsArr.length}`} description=" 年里我跑过" />
      <Stat value={countries.length} description=" 个国家" />
      <Stat value={provinces.length} description=" 个省份" />
      <Stat value={Object.keys(cities).length} description=" 个城市" />
    </section>
    <hr color="red" />
  </div>
);

const CitiesStat = () => {
  const citiesArr = Object.entries(cities);
  citiesArr.sort((a, b) => b[1] - a[1]);
  return (
    <div style={{ cursor: 'pointer' }}>
      <section>
        {citiesArr.map(([city, distance]) => (
          <Stat value={city} description={` ${(distance / 1000).toFixed(0)} KM`} citySize={3} />
        ))}
      </section>
      <hr color="red" />
    </div>
  );
};

const RunMap = ({
  runs, year, title, viewport, setViewport, changeYear, geoData,
}) => {
  year = year || '2020';

  const [lastWidth, setLastWidth] = useState(0);
  const addControlHandler = (event) => {
    const map = event && event.target;
    // set lauguage to Chinese if you use English please comment it
    if (map) {
      map.addControl(
        new MapboxLanguage({
          defaultLanguage: 'zh',
        }),
      );
      map.setLayoutProperty('country-label-lg', 'text-field', [
        'get',
        'name_zh',
      ]);
    }
  };
  const filterProvinces = provinces.slice();
  // for geojson format
  filterProvinces.unshift('in', 'name');

  const dimensions = useDimensions({
    deferUpdateUntilIdle: true,
    disableScrollUpdates: true,
  });
  if (lastWidth !== dimensions.width) {
    setTimeout(() => {
      setViewport({ width: '100%', ...viewport });
      setLastWidth(dimensions.width);
    }, 0);
  }
  const isBigMap = (viewport.zoom <= 3);
  if (isBigMap) {
    geoData = geoJsonForMap();
  }

  return (
    <ReactMapGL
      {...viewport}
      mapStyle="mapbox://styles/mapbox/dark-v9"
      onViewportChange={setViewport}
      onLoad={addControlHandler}
      mapboxApiAccessToken={MAPBOX_TOKEN}
    >
      <RunMapButtons changeYear={changeYear} />
      <Source id="data" type="geojson" data={geoData}>

        <Layer
          id="runs2"
          type="line"
          paint={{
            'line-color': 'rgb(224,237,94)',
            'line-width': isBigMap ? 1 : 2,
          }}
          layout={{
            'line-join': 'round',
            'line-cap': 'round',
          }}
        />
        <Layer
          id="prvince"
          type="fill"
          paint={{
            'fill-color': '#47b8e0',
          }}
          filter={filterProvinces}
        />
      </Source>
      <span className={styles.runTitle}>{title}</span>
    </ReactMapGL>
  );
};

const RunMapWithViewport = (props) => (
  <ViewportProvider>
    <RunMap {...props} />
  </ViewportProvider>
);

const RunMapButtons = ({ changeYear }) => {
  const yearsButtons = yearsArr.slice();
  yearsButtons.push('Total');
  const [index, setIndex] = useState(0);
  const handleClick = (e, year) => {
    const elementIndex = yearsButtons.indexOf(year);
    e.target.style.color = 'rgb(224,237,94)';

    const elements = document.getElementsByClassName(styles.button);
    elements[index].style.color = 'white';
    setIndex(elementIndex);
  };
  return (
    <div>
      <ul className={styles.buttons}>
        {yearsButtons.map((year) => (
          <li
            key={`${year}button`}
            style={{ color: year === '2020' ? 'rgb(224,237,94)' : 'white' }}
            year={year}
            onClick={(e) => {
              changeYear(year);
              handleClick(e, year);
            }}
            className={styles.button}
          >
            {year}
          </li>
        ))}
      </ul>
    </div>
  );
};

const RunTable = ({
  runs, year, locateActivity, setActivity,
}) => {
  const [runIndex, setRunIndex] = useState(-1);
  const [sortFuncInfo, setSortFuncInfo] = useState('');
  if (!yearsArr.includes(year)) {
    // When total show 2020
    year = '2020';
  }
  // TODO refactor?
  const sortKMFunc = (a, b) => (sortFuncInfo === 'KM' ? a.distance - b.distance : b.distance - a.distance);
  const sortPaceFunc = (a, b) => (sortFuncInfo === 'Pace' ? a.average_speed - b.average_speed : b.average_speed - a.average_speed);
  const sortBPMFunc = (a, b) => (sortFuncInfo === 'BPM' ? a.average_heartrate - b.average_heartrate : b.average_heartrate - a.average_heartrate);
  const sortDateFuncClick = sortFuncInfo === 'Date' ? sortDateFunc : sortDateFuncReverse;
  const sortFuncMap = new Map([
    ['KM', sortKMFunc],
    ['Pace', sortPaceFunc],
    ['BPM', sortBPMFunc],
    ['Date', sortDateFuncClick],
  ]);
  const handleClick = (e) => {
    const funcName = e.target.innerHTML;
    if (sortFuncInfo === funcName) {
      setSortFuncInfo('');
    } else {
      setSortFuncInfo(funcName);
    }
    const f = sortFuncMap.get(e.target.innerHTML);
    setActivity(filterAndSortRuns(runs, year, f));
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.runTable} cellSpacing="0" cellPadding="0">
        <thead>
          <tr>
            <th />
            <th onClick={(e) => handleClick(e)}>KM</th>
            <th onClick={(e) => handleClick(e)}>Pace</th>
            <th onClick={(e) => handleClick(e)}>BPM</th>
            <th onClick={(e) => handleClick(e)}>Date</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <RunRow
              runs={runs}
              run={run}
              key={run.strava_id}
              locateActivity={locateActivity}
              runIndex={runIndex}
              setRunIndex={setRunIndex}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RunRow = ({
  runs, run, locateActivity, runIndex, setRunIndex,
}) => {
  const distance = (run.distance / 1000.0).toFixed(1);
  const pace = run.average_speed;

  const paceParts = pace ? formatPace(pace) : null;

  const heartRate = run.average_heartrate;

  // change click color
  const handleClick = (e, runs, run) => {
    const elementIndex = runs.indexOf(run);
    e.target.parentElement.style.color = 'red';

    const elements = document.getElementsByClassName(styles.runRow);
    if (runIndex !== -1) {
      elements[runIndex].style.color = 'rgb(224,237,94)';
    }
    setRunIndex(elementIndex);
  };

  return (
    <tr
      className={styles.runRow}
      key={run.start_date_local}
      onClick={(e) => {
        handleClick(e, runs, run);
        locateActivity(run);
      }}
    >
      <td>{titleForRun(run)}</td>
      <td>{distance}</td>
      {pace && <td>{paceParts}</td>}
      <td>{heartRate && heartRate.toFixed(0)}</td>
      <td className={styles.runDate}>{run.start_date_local}</td>
    </tr>
  );
};

const Stat = ({
  value, description, className, citySize,
}) => (
  <div className={`${className} pb2 w-100`}>
    <span className={`f${citySize || 1} fw9 i`}>{intComma(value)}</span>
    <span className="f3 fw6 i">{description}</span>
  </div>
);
