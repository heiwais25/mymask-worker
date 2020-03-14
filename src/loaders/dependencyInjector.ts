import { Container } from "typedi";
import logger from "./logger";
import { keys, values } from "../utils/base";
import { IRedisSets } from "./redis";
import { InfluxDB } from "influx";
import { TYPEDI_INFLUX_KEY } from "../constants";

type Args = {
  redisSets: IRedisSets;
  influx: InfluxDB;
};

export default ({ redisSets, influx }: Args) => {
  try {
    values(redisSets).map(value => Container.set(value.key, value.redis));

    Container.set(TYPEDI_INFLUX_KEY, influx);
  } catch (e) {
    logger.error("⛈  Error on dependency injectory : %o", e);
    throw e;
  }
};
