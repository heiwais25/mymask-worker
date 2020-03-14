import Queue, { Queue as IQueue } from "bull";
import { REGULAR_FETCH_BULL } from "../constants";
import configs from "../configs";

export type IBullSet = {
  key: string;
  queue: IQueue;
};

export type IBullSets = {
  regularFetchQueue: IBullSet;
};

export default (): IBullSets => {
  const regularFetchQueue = {
    key: REGULAR_FETCH_BULL,
    queue: new Queue(REGULAR_FETCH_BULL, {
      redis: { port: configs.bull.port, host: configs.bull.host }
    })
  };
  return { regularFetchQueue };
};
