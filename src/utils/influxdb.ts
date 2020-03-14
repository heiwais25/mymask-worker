import { IStore } from "../maps";
import { MEASUREMENT_REQUEST_AGENT, MEASUREMENT_STOCK_AT } from "../constants";
import configs from "../configs";

export type ClickCountQueryResult = {
  time: Date;
  count_stockAt: number; // TODO : CHANGE IT TO PROPER REQUEST AGENT
  code: string;
};

export const getClickCountQuery = () => `
    SELECT COUNT(*) FROM ${MEASUREMENT_STOCK_AT} 
    WHERE time > now() - ${configs.clickCountTimeRange} GROUP BY "code";
`;

// export const getClickCountQuery = (store: IStore) => `
//     SELECT COUNT(*) FROM ${MEASUREMENT_REQUEST_AGENT}
//     WHERE "code" = '${store.code}' AND time > now() - ${configs.clickCountTimeRange};
// `;

export type LatestStockAtsResult = {
  time: Date;
  stockAt: string;
  code: string;
};

// export const getLatestStockAtsQuery = (store: IStore) => `
//     SELECT COUNT(*) FROM ${MEASUREMENT_STOCK_AT}
//     WHERE "code" = '${store.code}' AND time > now() - ${configs.latestStockAtRange};
// `;

export const getLatestStockAtsQuery = () => `
    SELECT * FROM ${MEASUREMENT_STOCK_AT} 
    WHERE time > now() - ${configs.latestStockAtRange} 
    GROUP BY "code";
`;
