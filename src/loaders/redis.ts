import {} from "./logger";
import redis, { RedisClient } from "redis";
import {
  STORE_BY_CODE_REDIS,
  STORE_BY_GEO_REDIS,
  SECTION_STATE_REDIS,
  REDIS_MAX_CONNECTION_TIMEOUT
} from "../constants";
import configs from "../configs";
import logger from "./logger";

export type IRedisSet = {
  key: string;
  redis: RedisClient;
};

export type IRedisSets = {
  storesByCodeRedis: IRedisSet;
  storesByGeoRedis: IRedisSet;
  validSearchRangeRedis: IRedisSet;
};

export default (): IRedisSets => {
  logger.info(`💁  Run Redis on ${configs.redis.host}:${configs.redis.port}`);

  try {
    // 1. Store by key
    const storesByCodeRedis: IRedisSet = {
      key: STORE_BY_CODE_REDIS,
      redis: redis.createClient({
        prefix: STORE_BY_CODE_REDIS,
        host: configs.redis.host,
        port: configs.redis.port,
        retry_strategy: option => {
          console.log(option);
          if (option.total_retry_time > REDIS_MAX_CONNECTION_TIMEOUT) {
            throw Error("Connection failed");
          }
          return 1000;
        }
      })
    };

    // 2. Store by geolocation
    const storesByGeoRedis: IRedisSet = {
      key: STORE_BY_GEO_REDIS,
      redis: redis.createClient({
        prefix: STORE_BY_GEO_REDIS,
        host: configs.redis.host,
        port: configs.redis.port,
        retry_strategy: option => {
          console.log(option);
          if (option.total_retry_time > REDIS_MAX_CONNECTION_TIMEOUT) {
            throw Error("Connection failed");
          }
          return 1000;
        }
      })
    };

    const validSearchRangeRedis: IRedisSet = {
      key: SECTION_STATE_REDIS,
      redis: redis.createClient({
        prefix: SECTION_STATE_REDIS,
        host: configs.redis.host,
        port: configs.redis.port,
        retry_strategy: option => {
          console.log(option);
          if (option.total_retry_time > REDIS_MAX_CONNECTION_TIMEOUT) {
            throw Error("Connection failed");
          }
          return 1000;
        }
      })
    };

    // 3. Redis bull (In future)
    return { storesByCodeRedis, storesByGeoRedis, validSearchRangeRedis };
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
