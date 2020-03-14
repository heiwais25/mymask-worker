import { RedisClient } from "redis";
import { STORE_BY_GEO_SET_NAME } from "../constants";
import _ from "lodash";

export function geoAddAsync(redis: RedisClient, lat: number, lng: number, key: string) {
  return new Promise<number>((res, rej) => {
    redis.geoadd(STORE_BY_GEO_SET_NAME, lng, lat, key, (error, value) => {
      if (error) {
        rej(error);
      } else {
        res(value);
      }
    });
  });
}

export function mgeoAddAsyncObject<O>(
  redis: RedisClient,
  values: { lat: number; lng: number; key: string }[]
) {
  const multi = redis.multi();
  values.forEach(item => {
    multi.geoadd(STORE_BY_GEO_SET_NAME, item.lng, item.lat, item.key);
  });

  return new Promise((res, rej) => {
    multi.exec((error, value) => {
      if (error) {
        rej(error);
      } else {
        res(value);
      }
    });
  });
}

export function getAsync(redis: RedisClient, key: string) {
  return new Promise((res, rej) => {
    redis.get(key, (error, value) => {
      if (error) {
        rej(error);
      } else {
        res(value);
      }
    });
  });
}

export function mgetAsync(redis: RedisClient, keys: string[]) {
  const multi = redis.multi();
  keys.forEach(key => {
    multi.get(key);
  });
  return new Promise((res, rej) => {
    multi.exec((error, value) => {
      if (error) {
        rej(error);
      } else {
        res(value);
      }
    });
  });
}

export function mgetObjectAsync<O>(redis: RedisClient, keys: string[]) {
  return new Promise<O[]>((res, rej) => {
    redis.mget(keys, (error, values) => {
      if (error) {
        rej(error);
      } else {
        res(
          values.map<O>(value => JSON.parse(value))
        );
      }
    });
  });
}

export function setAsync(redis: RedisClient, key: string, value: string) {
  return new Promise((res, rej) => {
    redis.set(key, value, (error, value) => {
      if (error) {
        rej(error);
      } else {
        res(value);
      }
    });
  });
}

export function msetAsyncObject<O>(redis: RedisClient, values: { key: string; value: O }[]) {
  const multi = redis.multi();
  values.forEach(item => {
    multi.set(item.key, JSON.stringify(item.value));
  });

  return new Promise((res, rej) => {
    multi.exec((error, value) => {
      if (error) {
        rej(error);
      } else {
        res(value);
      }
    });
  });
}

export function rpushReplaceAsyncObject<O>(redis: RedisClient, key: string, values: O[]) {
  const multi = redis.multi();
  multi.del(key);
  values.forEach(item => {
    multi.rpush(key, JSON.stringify(item));
  });

  return new Promise((res, rej) => {
    multi.exec((error, value) => {
      if (error) {
        rej(error);
      } else {
        res(value);
      }
    });
  });
}

export function rpushAsyncObject<O>(redis: RedisClient, key: string, values: O[]) {
  const multi = redis.multi();
  values.forEach(item => {
    multi.rpush(key, JSON.stringify(item));
  });

  return new Promise((res, rej) => {
    multi.exec((error, value) => {
      if (error) {
        rej(error);
      } else {
        res(value);
      }
    });
  });
}

export function lrangeAsyncObject<O>(redis: RedisClient, key: string, start: number, end: number) {
  return new Promise<O[]>((res, rej) => {
    redis.lrange(key, start, end, (error, values) => {
      if (error) {
        rej(error);
      } else {
        res(
          values.map<O>(value => JSON.parse(value))
        );
      }
    });
  });
}

export function getAsyncObject<O>(redis: RedisClient, key: string) {
  return new Promise<O>((res, rej) => {
    redis.get(key, (error, value) => {
      if (error) {
        rej(error);
      } else {
        res(JSON.parse(value) as O);
      }
    });
  });
}

export function setAsyncObject<T>(redis: RedisClient, key: string, value: T) {
  return new Promise((res, rej) => {
    redis.set(key, JSON.stringify(value), (error, value) => {
      if (error) {
        rej(error);
      } else {
        res(value);
      }
    });
  });
}
