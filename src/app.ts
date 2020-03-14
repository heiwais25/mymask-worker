import "reflect-metadata";
import express from "express";
import loaders from "./loaders";
import configs from "./configs";
import logger from "./loaders/logger";
import { SectionStateService } from "./services/sectionStateService";
import { Container } from "typedi";
import { StoreTrackerService } from "./services/storeTrackerService";
import { ILatLng } from "./maps";
import { validLatLangs } from "./data";
import {
  SECTION_STATE_REDIS,
  SECTION_STATE_KEY,
  SCAN_START_LATLANG,
  SCAN_END_LATLANG
} from "./constants";
import { RedisClient } from "redis";
import { lrangeAsyncObject } from "./utils/redis";

const sampleLatLang: ILatLng = {
  lat: 37.564214,
  lng: 127.001699
};

const serverStart = async () => {
  const app = express();

  await loaders(app);

  app.listen(configs.port, () => {
    logger.info(`🔥  Server is running on the port ${configs.port}`);
  });

  // const sectionStateRedis = Container.get(SECTION_STATE_REDIS) as RedisClient;

  // const storeTrackerService = Container.get(StoreTrackerService);

  // const sectionStates = await lrangeAsyncObject<ILatLng>(
  //   sectionStateRedis,
  //   SECTION_STATE_KEY,
  //   0,
  //   -1
  // );

  // let latLangsInput = sectionStates
  //   .filter(item => item.valid)
  //   .map(item => ({ lat: item.lat, lng: item.lng }));
  // if (latLangsInput.length === 0) {
  //   latLangsInput = validLatLangs;
  // }
  // await storeTrackerService.fetchDataBatch({
  //   latLangs: latLangsInput,
  //   batchUnit: configs.fetchBatchSize,
  //   distance: configs.fetchDistance
  // });

  // const sectionStateService = Container.get(SectionStateService);
  // await sectionStateService.scan(SCAN_START_LATLANG, SCAN_END_LATLANG, {
  //   batchSize: configs.fetchBatchSize,
  //   distance: configs.fetchDistance
  // });
};

serverStart();
