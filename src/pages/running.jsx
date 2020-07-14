import React, { Fragment, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import * as mapboxPolyline from "@mapbox/polyline";
import ReactMapGL, { Source, Layer, FlyToInterpolator } from "react-map-gl";
import { ViewportProvider, useDimensions } from "react-viewport-utils";

import Layout from "../components/layout";
import { activities } from "../static/activities";

import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./running.module.scss";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoieWlob25nMDYxOCIsImEiOiJja2J3M28xbG4wYzl0MzJxZm0ya2Fua2p2In0.PNKfkeQwYuyGOTT_x9BJ4Q";

// Page

export default () => {
  const [year, setYear] = useState("2020");
  const changeYear = (year) => {
    setYear(year);
    window.scroll(0, 0);
    setActivity(activities);
  };
  const [runs, setActivity] = useState(activities);
  const [viewport, setViewport] = useState({
    width: "100%",
    height: 400,
    latitude: 38.862,
    longitude: 121.514,
    zoom: 11.5,
  });
  const locateActivity = (run) => {
    // TODO maybe filter some activities in the future
    setActivity([run]);
    const geoData = geoJsonForRuns([run], run.start_date_local.slice(0, 4));
    const startPoint = geoData.features[0].geometry.coordinates[0];
    setViewport({
      width: "100%",
      height: 400,
      latitude: startPoint[1],
      longitude: startPoint[0],
      zoom: 14.5,
    });
    window.scroll(0, 0);
  };

  return (
    <Fragment>
      <Helmet bodyAttributes={{ class: styles.body }} />
      <Layout>
        <div className="mb5">
          <div className="w-100">
            <h1 className="f1 fw9 i">Running</h1>
          </div>
          <YearsStat runs={activities} year={year} onClick={changeYear} />
          <div className="fl w-100 w-70-l">
            {runs.length === 1 ? (
              <RunMapWithViewport
                runs={runs}
                year={year}
                viewport={viewport}
                setViewport={setViewport}
              />
            ) : (
              <RunMapWithViewport
                runs={activities}
                year={year}
                viewport={viewport}
                setViewport={setViewport}
              />
            )}
            <RunTable
              runs={activities}
              year={year}
              locateActivity={locateActivity}
            />
          </div>
        </div>
      </Layout>
    </Fragment>
  );
};

// Child components

const YearsStat = ({ runs, year, onClick }) => {
  // for short solution need to refactor
  const yearsArr = [
    "2012",
    "2013",
    "2014",
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
  ].reverse();
  return (
    <div className="fl w-100 w-30-l pb5 pr5-l">
      <section className="pb4">
        {/* TODO 2020作为变量 */}
        <p>我用app记录自己跑步8年有余，下面列表展示的是{year}的数据</p>
        <p>
          现在我用NRC记录自己跑步{" "}
          <a className="dark-gray b" href="https://www.nike.com/nrc-app">
            Nike Run Club
          </a>{" "}
          希望能激励自己前行，不要停下来。这个展示也是我学习React的第一个项目，
          希望自己有所成长。
          <p>The best is yet to come.</p>
        </p>
      </section>
      <hr color={"red"} />
      {yearsArr.map((year) => (
        <YearStat runs={runs} year={year} onClick={onClick} />
      ))}
    </div>
  );
};

const YearStat = ({ runs, year, onClick }) => {
  runs = runs.filter((run) => run.start_date_local.slice(0, 4) === year);
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
    0
  );
  return (
    <div style={{ cursor: "pointer" }} onClick={() => onClick(year)}>
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
      <hr color={"red"} />
    </div>
  );
};

const RunMap = ({ runs, year, viewport, setViewport }) => {
  year = year || "2020";
  const geoData = geoJsonForRuns(runs, year);
  const startPoint = geoData.features[0].geometry.coordinates[0];
  // const [viewport, setViewport] = useState({
  //   width: "100%",
  //   height: 400,
  //   latitude: 38.862,
  //   longitude: 121.514,
  //   zoom: 11.5,
  // });

  const [lastWidth, setLastWidth] = useState(0);

  const dimensions = useDimensions({
    deferUpdateUntilIdle: true,
    disableScrollUpdates: true,
  });
  if (lastWidth !== dimensions.width) {
    setTimeout(() => {
      setViewport({ width: "100%", ...viewport });
      setLastWidth(dimensions.width);
    }, 0);
  }

  return (
    <ReactMapGL
      {...viewport}
      mapStyle="mapbox://styles/mapbox/dark-v9?optimize=true"
      onViewportChange={setViewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
    >
      <Source id="data" type="geojson" data={geoData}>
        <Layer
          id="runs"
          type="line"
          paint={{
            "line-color": "rgb(224,237,94)",
            "line-width": 2,
          }}
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
        />
      </Source>
    </ReactMapGL>
  );
};

const RunMapWithViewport = (props) => (
  <ViewportProvider>
    <RunMap {...props} />
  </ViewportProvider>
);

const RunTable = ({ runs, year, locateActivity }) => {
  runs = runs.filter((run) => run.start_date_local.slice(0, 4) === year);
  runs = runs.sort((a, b) => {
    return new Date(b.start_date_local) - new Date(a.start_date_local);
  });
  return (
    <div className={styles.tableContainer}>
      <table className={styles.runTable} cellSpacing="0" cellPadding="0">
        <thead>
          <tr>
            <th />
            <th>KM</th>
            <th>Pace</th>
            <th>BPM</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <RunRow
              run={run}
              key={run.strava_id}
              locateActivity={locateActivity}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RunRow = ({ run, locateActivity }) => {
  const distance = (run.distance / 1000.0).toFixed(1);
  const pace = run.average_speed;

  const paceParts = pace ? formatPace(pace) : null;

  const heartRate = run.average_heartrate;

  return (
    <tr className={styles.runRow} onClick={() => locateActivity(run)}>
      <td>{titleForRun(run)}</td>
      <td>{distance}</td>
      {pace && <td>{paceParts}</td>}
      <td>{heartRate && heartRate.toFixed(0)}</td>
      <td className={styles.runDate}>{run.start_date_local}</td>
    </tr>
  );
};

const Stat = ({ value, description, className }) => {
  return (
    <div className={`${className} pb2 w-100`}>
      <span className="f1 fw9 i">{intComma(value)}</span>
      <span className="f3 fw6 i">{description}</span>
    </div>
  );
};

// Utilities

const intComma = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const pathForRun = (run) => {
  try {
    const c = mapboxPolyline.decode(run.summary_polyline);
    // reverse lat long for mapbox
    c.forEach((arr) => {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    });
    return c;
  } catch (err) {
    return [];
  }
};

const geoJsonForRuns = (runs, year) => {
  if (runs.length > 1) {
    runs = runs.filter((run) => run.start_date_local.slice(0, 4) === year);
  }
  return {
    type: "FeatureCollection",
    features: runs.map((run) => {
      const points = pathForRun(run);
      if (!points) {
        return null;
      }

      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: points,
        },
      };
    }),
  };
};

const titleForRun = (run) => {
  if (run.name.slice(0, 7) === "Running") {
    return "Run";
  }
  if (run.name) {
    return run.name;
  }
  return "Run";
};

const formatPace = (d) => {
  const pace = (1000.0 / 60.0) * (1.0 / d);
  const minutes = Math.floor(pace);
  const seconds = (pace - minutes) * 60.0;
  return `${minutes}:${seconds.toFixed(0).toString().padStart(2, "0")}`;
};
