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
import { getUTCFormatDate } from "../utils/date";
import moment from "moment-timezone";
import { LatestEmptyStatsResult, getLatestEmptyStatsQuery } from "../utils/influxdb";

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

    return newStores;
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
    let clickCountsByCode: { [key: string]: number } = {};
    const countQueryResults = await influx.query<ClickCountQueryResult>(getClickCountQuery());
    countQueryResults.forEach(item => {
      clickCountsByCode[item.code] = item.count_stockAt;
    });

    let latestStockAtsByCode: { [key: string]: { plenty?: Date; empty?: Date }[] } = {};
    const latestStockAtsResults = await influx.query<LatestStockAtsResult>(
      getLatestStockAtsQuery()
    );

    // Row stock at is not formatted as a UTC, so we need to convert to make sure timezone
    latestStockAtsResults.groups().forEach(item => {
      latestStockAtsByCode[item.tags["code"]] = item.rows.map(el => ({
        plenty: new Date(getUTCFormatDate(el.stockAt))
      }));
    });

    const emptyStatsResults = await influx.query<LatestEmptyStatsResult>(
      getLatestEmptyStatsQuery()
    );

    // Fill plenty and empty to each date
    emptyStatsResults.groups().forEach(item => {
      const stockLogs = latestStockAtsByCode[item.tags["code"]];
      item.rows.forEach(row => {
        const rowMoment = moment.tz(row.time, "Asia/Seoul");
        stockLogs.forEach(stock => {
          if (moment.tz(stock.plenty, "Asia/Seoul").date() === rowMoment.date() && !stock.empty) {
            stock.empty = rowMoment.toDate();
          }
        });
      });
    });

    return {
      oldStoresByCode,
      clickCountsByCode,
      latestStockAtsByCode
    };
  }
}
