import { Service, Container } from "typedi";
import {
  ILatLng,
  getStoreDataAPI,
  getInfluxPoint,
  IStore,
  IRawStore,
  IStoreLogTarget
} from "../maps";
import { RedisClient } from "redis";
import { InfluxDB, IPoint } from "influx";
import _ from "lodash";
import { STORE_BY_CODE_REDIS, STORE_BY_GEO_REDIS, TYPEDI_INFLUX_KEY } from "../constants";
import {
  getClickCountQuery,
  ClickCountQueryResult,
  LatestStockAtsResult,
  getLatestStockAtsQuery
} from "../utils/influxdb";
import { mgetObjectAsync, msetAsyncObject, mgeoAddAsyncObject } from "../utils/redis";
import logger from "../loaders/logger";

@Service()
export class StoreTrackerService {
  constructor() {}

  async fetchDataBatch({
    latLangs,
    distance = 5000,
    batchUnit = 500
  }: {
    latLangs: ILatLng[];
    distance?: number;
    batchUnit?: number;
  }) {
    const start = new Date().getTime();
    logger.info("⭐  Fetch Data Batch Start");

    const storesByCodeRedis = Container.get(STORE_BY_CODE_REDIS) as RedisClient;
    const storesByGeoRedis = Container.get(STORE_BY_GEO_REDIS) as RedisClient;
    const influx = Container.get(TYPEDI_INFLUX_KEY) as InfluxDB;

    const batchedLatLangs = _.chunk(latLangs, batchUnit);
    let rawStores: IRawStore[] = [];
    for (let batchedLatLang of batchedLatLangs) {
      const batchResult = await Promise.all(
        batchedLatLang.map(latLang =>
          getStoreDataAPI({ lat: latLang.lat, lng: latLang.lng, m: distance })
        )
      );
      rawStores.push(..._.flatten(batchResult));
    }

    rawStores = _.uniqBy(rawStores, "code").filter(store => {
      if (!store.lat || !store.lng || !store.code) {
        logger.error(
          `Invlaid location ${store.name} ${store.addr} ${store.code} ${store.lat} ${store.lng}`
        );
        return false;
      }
      return true;
    });

    const { oldStoresByCode, clickCountsByCode, latestStockAtsByCode } = await this.getStoreLogs(
      rawStores
    );

    const newStores = rawStores.map<IStore>(rawStore => ({
      ...rawStore,
      latest_click_counts: clickCountsByCode[rawStore.code] || 0,
      latest_stock_ats: latestStockAtsByCode[rawStore.code] || []
    }));

    // Get influxPoints to update (stockAt, remainStat)
    const influxPoints: IPoint[] = [];
    const measurements: IStoreLogTarget[] = ["stock_at", "remain_stat"];
    newStores.forEach(newStore => {
      const oldStore = oldStoresByCode[newStore.code];
      measurements.forEach(key => {
        if (!!newStore[key] && (!oldStore || oldStore[key] !== newStore[key])) {
          influxPoints.push(getInfluxPoint(key, newStore));
        }
      });
    });

    await Promise.all([
      influx.writePoints(influxPoints),
      msetAsyncObject<IStore>(
        storesByCodeRedis,
        newStores.map(store => ({ key: store.code, value: store }))
      ),
      mgeoAddAsyncObject(
        storesByGeoRedis,
        newStores.map(store => ({ key: store.code, lat: store.lat, lng: store.lng }))
      )
    ]);

    logger.info(
      `⭐  Fetch Data Batch Finished | Data length : ${
        rawStores.length
      } | Time : ${new Date().getTime() - start}ms`
    );
  }

  private async getStoreLogs(stores: IRawStore[]) {
    const storesByCodeRedis = Container.get(STORE_BY_CODE_REDIS) as RedisClient;
    const influx = Container.get(TYPEDI_INFLUX_KEY) as InfluxDB;

    let oldStoresByCode: { [key: string]: IRawStore }[] = [];
    if (stores.length) {
      (
        await mgetObjectAsync<IRawStore>(
          storesByCodeRedis,
          stores.map(store => store.code)
        )
      )
        .filter(store => store)
        .forEach(store => {
          oldStoresByCode[store.code] = store;
        });
    }

    // Prepare old datas
    const clickCountsByCode = (await influx.query<ClickCountQueryResult>(getClickCountQuery())).map(
      queryResult => ({
        [queryResult.code]: queryResult
      })
    );
    const latestStockAtsByCode = (
      await influx.query<LatestStockAtsResult>(getLatestStockAtsQuery())
    )
      .groups()
      .map(queryResult => ({
        [queryResult.tags["code"]]: queryResult.rows.map(item => item.stockAt)
      }));

    return {
      oldStoresByCode,
      clickCountsByCode,
      latestStockAtsByCode
    };
  }
}
