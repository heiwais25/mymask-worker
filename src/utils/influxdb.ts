import {
  MEASUREMENT_REMAIN_STAT,
  MEASUREMENT_STOCK_AT,
  MEASUREMENT_REQUEST_AGENT
} from "../constants";
import configs from "../configs";
import { IRemainStat } from "../services/sectionStateService";

export type ClickCountQueryResult = {
  time: Date;
  count_requestAgent: number; // TODO : CHANGE IT TO PROPER REQUEST AGENT
  code: string;
};

export const getClickCountQuery = () => `
    SELECT COUNT(*) FROM ${MEASUREMENT_REQUEST_AGENT} 
    WHERE time > now() - ${configs.clickCountTimeRange} GROUP BY "code";
`;

export type LatestStockAtsResult = {
  time: Date;
  stockAt: string;
  code: string;
};

export const getLatestStockAtsQuery = () => `
    SELECT * FROM ${MEASUREMENT_STOCK_AT} 
    WHERE time > now() - ${configs.latestRemainStatsRange} 
    GROUP BY "code";
`;

export type LatestEmptyStatsResult = {
  time: Date;
  remainStat: IRemainStat;
  code: string;
};

export const getLatestEmptyStatsQuery = () => `
    SELECT * FROM ${MEASUREMENT_REMAIN_STAT} 
    WHERE remainStat='empty' AND time > now() - ${configs.latestRemainStatsRange} 
    GROUP BY "code";
`;
