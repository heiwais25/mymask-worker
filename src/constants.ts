import { ILatLng } from "./services/sectionStateService";
export const STORE_BY_CODE_REDIS = "storesByCode:";
export const STORE_BY_GEO_REDIS = "storesByGeo:";
export const SECTION_STATE_REDIS = "sectionStateRedis:";

export const REGULAR_FETCH_BULL = "regularFetchBull";

export const SECTION_STATE_KEY = "sectionStateKey";

export const STORE_BY_GEO_SET_NAME = "locations";

export const INFLUX_DB_NAME = "mymask";
export const MEASUREMENT_REMAIN_STAT = "remainStat";
export const MEASUREMENT_STOCK_AT = "stockAt";
export const MEASUREMENT_REQUEST_AGENT = "requestAgent";

export const TYPEDI_INFLUX_KEY = "TYPEDI_INFLUX_KEY";

export const SCAN_START_LATLANG: ILatLng = { lat: 38.611111, lng: 124.61 };
export const SCAN_END_LATLANG: ILatLng = { lat: 33.111944, lng: 131.872778 };
