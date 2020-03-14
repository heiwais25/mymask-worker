import configs from "../configs";
import logger from "../loaders/logger";
import { Service, Container } from "typedi";
import { SECTION_STATE_REDIS, SECTION_STATE_KEY } from "../constants";
import { RedisClient } from "redis";
import { rpushAsyncObject, rpushReplaceAsyncObject } from "../utils/redis";
import _ from "lodash";
import { runAxiosBatch } from "../utils/axios";

export type IRemainStat = "few" | "empty" | "some" | "plenty";

export type IStore = {
  addr: string;
  name: string;
  code: string;
  created_at: string;
  lat: number;
  lng: number;
  stock_at: string;
  type: string;
  distance: number;
  remain_stat: IRemainStat;
};

export type StoreResponseData = {
  count: number;
  stores: IStore[];
};
export type IFetchParam = {
  lat: number;
  lng: number;
  m: number;
};

export type ILatLng = {
  lat: number;
  lng: number;
  valid?: boolean;
};

@Service()
export class SectionStateService {
  // North West to South East
  async scan(
    start: ILatLng,
    end: ILatLng,
    {
      batchSize = 100,
      distance = 5000,
      latUnit = 0.0304,
      lngUnit = 0.038
    }: { latUnit?: number; lngUnit?: number; batchSize?: number; distance?: number }
  ) {
    const validSearchRangeRedis = Container.get(SECTION_STATE_REDIS) as RedisClient;
    const latLngs: ILatLng[] = this.getSearchLatLangs(start, end, latUnit, lngUnit);
    let results: StoreResponseData[] = [];

    try {
      logger.info("⭐  Search Valid Range Start");
      const start = new Date().getTime();

      results = await runAxiosBatch<IFetchParam, StoreResponseData>(
        configs.storeDataAPI,
        latLngs.map(latLng => ({ lat: latLng.lat, lng: latLng.lng, m: distance })),
        { batchSize: batchSize }
      );

      results.forEach((result, idx) => {
        latLngs[idx].valid = result.count > 0;
      });

      await rpushReplaceAsyncObject(validSearchRangeRedis, SECTION_STATE_KEY, latLngs);
      logger.info(`⭐  Search Valid Range Finish | Time : ${new Date().getTime() - start}`);
    } catch (err) {
      logger.info("Error Occured");
    }
  }

  private getSearchLatLangs(start: ILatLng, end: ILatLng, latUnit: number, lngUnit: number) {
    const latLngs: ILatLng[] = [];
    let currentLatLngs: ILatLng = { ...start };
    while (true) {
      if (currentLatLngs.lng >= end.lng + lngUnit) {
        currentLatLngs.lng = start.lng;
        currentLatLngs.lat -= latUnit;
      }

      if (currentLatLngs.lat < end.lat && currentLatLngs.lng > end.lng) {
        break;
      }

      latLngs.push({ ...currentLatLngs });
      currentLatLngs.lng += lngUnit;
    }
    return latLngs;
  }
}
