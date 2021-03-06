import dotenv from "dotenv";

dotenv.config();

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const requiredEnvs = ["STORE_DATA_API"];
if (requiredEnvs.some(key => !process.env[key])) {
  throw Error(`Required fields are not supplied ${requiredEnvs}`);
}

export default {
  port: parseInt(process.env.PORT || "4000"),
  storeDataAPI: process.env.STORE_DATA_API || "",
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379")
  },
  influxdb: {
    host: process.env.INFLUXDB_HOST || "127.0.0.1",
    port: parseInt(process.env.INFLUXDB_POST || "8086")
  },
  bull: {
    host: process.env.BULL_HOST || "127.0.0.1",
    port: parseInt(process.env.BULL_PORT || "6379"),
    attempts: parseInt(process.env.BULL_ATTEMPTS || "5"),
    backoff: parseInt(process.env.BULL_BACKOFF || "5000")
  },
  clickCountTimeRange: process.env.LATEST_CLICK_COUNT_RANGE || "120m",
  latestRemainStatsRange: process.env.LATEST_REMAIN_STAT_RANGE || "7d",

  fetchDistance: parseInt(process.env.FETCH_DISTANCE || "5000"),
  fetchBatchSize: parseInt(process.env.FETCH_BATCH || "100")
};
