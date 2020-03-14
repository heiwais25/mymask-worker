import axios from "axios";
import configs from "./configs";
import { IPoint, FieldType } from "influx";
import { getMeasurementName } from "./loaders/influxdb";
import { ManualMappingLocation } from "./data";
import _ from "lodash";

export type IRemainStat = "few" | "empty" | "some" | "plenty";

export type IRawStore = {
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
  latest_click_counts: number;
  latest_stock_ats: string[];
};

export type StoreResponseData = {
  count: number;
  stores: IRawStore[];
};

export type IFetchParams = {
  lat: number;
  lng: number;
  m: number;
};

export type IStoreLogTarget = "stock_at" | "remain_stat";

export const getInfluxPoint = (target: IStoreLogTarget, store: IStore): IPoint => {
  const measurementName = getMeasurementName(target);

  let fields: {
    [name: string]: FieldType;
  };

  if (target === "stock_at") {
    fields = {
      stockAt: (store.stock_at as unknown) as FieldType.STRING
    };
  } else {
    fields = {
      remainStat: (store.remain_stat as unknown) as FieldType.STRING
    };
  }

  return {
    measurement: measurementName,
    tags: { code: store.code },
    fields,
    timestamp: new Date()
  };
};

export const getStoreDataAPI = async (params: IFetchParams) => {
  try {
    const result = await axios.get<StoreResponseData>(configs.storeDataAPI, {
      params
    });
    return result.data.stores.map(store => {
      if (!store.lat) {
        store.lat = ManualMappingLocation[store.code].lat;
        store.lng = ManualMappingLocation[store.code].lng;
      }
      return store;
    });
  } catch (err) {
    throw err;
  }
};

export async function getStoreDataBatchAPI(
  latLngs: ILatLng[],
  { distance = 5000, batchSize = 100 }: { distance?: number; batchSize?: number }
) {
  const batchedLatLangs = _.chunk(latLngs, batchSize);
  const batchResults: IRawStore[] = [];
  for (let batchedLatLang of batchedLatLangs) {
    let batchResult = await Promise.all(
      batchedLatLang.map(latLng =>
        getStoreDataAPI({ lat: latLng.lat, lng: latLng.lng, m: distance })
      )
    );
    batchResults.push(..._.flatten(batchResult));
  }
  return batchResults;
}

export type ILatLng = {
  lat: number;
  lng: number;
  valid?: boolean;
};
