import Influx from "influx";
import configs from "../configs";
import logger from "./logger";
import {
  INFLUX_DB_NAME,
  MEASUREMENT_REMAIN_STAT,
  MEASUREMENT_STOCK_AT,
  MEASUREMENT_REQUEST_AGENT
} from "../constants";
import { IStoreLogTarget } from "../maps";

export const getMeasurementName = (key: IStoreLogTarget) => {
  if (key === "remain_stat") {
    return MEASUREMENT_REMAIN_STAT;
  } else if (key === "stock_at") {
    return MEASUREMENT_STOCK_AT;
  } else {
    logger.error("Error occured");
    return MEASUREMENT_STOCK_AT;
  }
};

export default async () => {
  logger.info(`💁  Run Influx on ${configs.influxdb.host}:${configs.influxdb.port}`);

  try {
    const influx = new Influx.InfluxDB({
      host: configs.influxdb.host,
      port: configs.influxdb.port,
      database: INFLUX_DB_NAME,
      schema: [
        {
          measurement: MEASUREMENT_REMAIN_STAT,
          fields: {
            remainStat: Influx.FieldType.STRING
          },
          tags: ["code"]
        },
        {
          measurement: MEASUREMENT_STOCK_AT,
          fields: {
            stockAt: Influx.FieldType.STRING
          },
          tags: ["code"]
        },
        {
          measurement: MEASUREMENT_REQUEST_AGENT,
          fields: {
            requestAgent: Influx.FieldType.STRING
          },
          tags: ["code"]
        }
      ]
    });
    const databases = await influx.getDatabaseNames();
    if (!databases.includes(INFLUX_DB_NAME)) {
      await influx.createDatabase(INFLUX_DB_NAME);
    }
    return influx;
  } catch (e) {
    logger.error("⛈  Error on dependency injectory : %o", e);
    throw e;
  }
};
