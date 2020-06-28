import React, { Fragment, useState } from "react";
import { format as formatDate } from "date-fns";
import { Helmet } from "react-helmet";
import { graphql } from "gatsby";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import { ViewportProvider, useDimensions } from "react-viewport-utils";

import Layout from "../components/layout";

import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./running.module.scss";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoieWlob25nMDYxOCIsImEiOiJja2J3M28xbG4wYzl0MzJxZm0ya2Fua2p2In0.PNKfkeQwYuyGOTT_x9BJ4Q";

// Page

export default ({ data }) => {
  const runs = data.runs.nodes;
  return (
    <Fragment>
      <Helmet bodyAttributes={{ class: styles.body }} />
      <Layout>
        <div className="mb5">
          <div className="w-100">
            <h1 className="f1 fw9 i">Running</h1>
          </div>
          <div className="fl w-100 w-30-l pb5 pr5-l">
            <section className="pb4">
              <p>
                我用app记录自己跑步8年有余，下面列表展示的是今年的数据
              </p>
              <p>
                现在我用NRC记录自己跑步{" "}
                <a className="dark-gray b" href="https://www.nike.com/nrc-app">
                  Nike Run Club
                </a>{" "}
              </p>
            </section>
            <section>
              <Stat value={2020} description={"跑步旅程"} />
              <Stat value={data.runs.totalCount} description={"Runs"} />
              <Stat
                value={calcMetricTotal(runs, "distance")}
                description={"KM"}
              />
            </section>
            <section className="mt4">
              <Stat
                value={`${calculateRunStreak(data.runs)} day`}
                description={"streak"}
                className="mb0 pb0"
              />
              <p className="mt0">
                <small>Consecutive days run allowing for 1 rest day.</small>
              </p>
            </section>
          </div>
          <div className="fl w-100 w-70-l">
            <RunMapWithViewport runs={runs} />
            <RunTable runs={runs} />
          </div>
        </div>
      </Layout>
    </Fragment>
  );
};

export const query = graphql`
  query {
    runs: allActivitiesJson(
      sort: { fields: start_epoch_ms, order: DESC }
      # Filter to above 60s to exclude cancelled runs
      filter: { active_duration_ms: { gt: 60000 } }
    ) {
      nodes {
        id
        start_epoch_ms
        summaries {
          metric
          value
          summary
        }
        metrics {
          type
          values {
            value
          }
        }
      }
      totalCount
    }
  }
`;

// Child components

const RunMap = ({ runs }) => {
  const [viewport, setViewport] = useState({
    width: "100%",
    height: 400,
    latitude: 38.862,
    longitude: 121.514,
    zoom: 11.5,
  });

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
      mapStyle="mapbox://styles/mapbox/dark-v9"
      onViewportChange={setViewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
    >
      <Source id="data" type="geojson" data={geoJsonForRuns(runs)}>
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

const RunTable = ({ runs }) => (
  <div className={styles.tableContainer}>
    <table className={styles.runTable} cellSpacing="0" cellPadding="0">
      <thead>
        <tr>
          <th></th>
          <th>KM</th>
          <th>KCAL</th>
          <th>Pace</th>
          <th>BPM</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {runs.map((run) => (
          <RunRow run={run} key={run.id} />
        ))}
      </tbody>
    </table>
  </div>
);

const RunRow = ({ run }) => {
  const distance = run.summaries.find(
    (x) => x.summary === "total" && x.metric === "distance"
  );

  const calories = run.summaries.find(
    (x) => x.summary === "total" && x.metric === "calories"
  );

  const pace = run.summaries.find(
    (x) => x.summary === "mean" && x.metric === "pace"
  );

  const paceParts = pace ? decimalToMinsSecs(pace.value) : null;

  const heartRate = run.summaries.find(
    (x) => x.summary === "mean" && x.metric === "heart_rate"
  );

  return (
    <tr className={styles.runRow}>
      <td>{titleForRun(run)}</td>
      <td>{distance && distance.value.toFixed(2)}</td>
      <td>{calories && calories.value.toFixed(0)}</td>
      {pace && (
        <td>
          {paceParts.minutes}:
          {paceParts.seconds < 10 ? `0${paceParts.seconds}` : paceParts.seconds}{" "}
        </td>
      )}
      <td>{heartRate && heartRate.value.toFixed(0)}</td>
      <td className={styles.runDate}>
        {formatDate(new Date(run.start_epoch_ms), "do MMM yyyy")}
      </td>
    </tr>
  );
};

const Stat = ({ value, description, className }) => (
  <div className={`${className} pb2 w-100`}>
    <span className="f1 fw9 i">{intComma(value)} </span>
    <span className="f3 fw6 i">{description}</span>
  </div>
);

// Utilities

const calcMetricTotal = (runs, metric) =>
  runs
    .reduce((distance, run) => {
      const summary = run.summaries.find((s) => s.metric === metric);
      return summary ? distance + summary.value : distance;
    }, 0)
    .toFixed(0);

const intComma = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const geoJsonForRuns = (runs) => ({
  type: "FeatureCollection",
  features: runs
    .map((run) => {
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
    })
    .filter((x) => !!x),
});

const pathForRun = (run) => {
  try {
    const lats = run.metrics
      .find((x) => x.type === "latitude")
      .values.map((x) => x.value);
    const longs = run.metrics
      .find((x) => x.type === "longitude")
      .values.map((x) => x.value);
    return longs.map((x, idx) => [x, lats[idx]]);
  } catch (err) {
    return [];
  }
};

const titleForRun = (run) => {
  return "Run";
};

const capWord = (word) => {
  word = word.toLowerCase();

  const ignores = ["a", "the", "of", "to", "with"];

  if (ignores.includes(word)) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.substr(1);
};

const decimalToMinsSecs = (value) => {
  const minutes = Math.floor(value);
  const rem = value - minutes;
  const seconds = (60 * rem).toFixed(0);
  return { minutes, seconds };
};

const calculateRunStreak = (runs) => {
  let count = 1;
  let hasHadRestDay = false;
  let skippingRestDay = false;
  let lastDay = roundDate(new Date(runs.nodes[0].start_epoch_ms));

  const oneDay = 86400000;
  const twoDays = 86400000 * 2;

  for (let i = 1; i < runs.nodes.length; i++) {
    const day = roundDate(new Date(runs.nodes[i].start_epoch_ms));
    const diff = lastDay - day;
    if (diff === oneDay || diff === 0 || skippingRestDay) {
      lastDay = day;
      count += 1;
      skippingRestDay = false;
    } else if (!hasHadRestDay && diff === twoDays) {
      hasHadRestDay = true;
      skippingRestDay = true;
      lastDay = day;
      count += 1;
    } else {
      return count;
    }
  }
  return count;
};

const roundDate = (date) => {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};
