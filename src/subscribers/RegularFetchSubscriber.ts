import { Container } from "typedi";
import { StoreTrackerService } from "../services/storeTrackerService";
import { lrangeAsyncObject } from "../utils/redis";
import { ILatLng } from "../services/sectionStateService";
import { SECTION_STATE_REDIS, SECTION_STATE_KEY } from "../constants";
import configs from "../configs";
import { validLatLangs } from "../data";
import logger from "../loaders/logger";
import { RedisClient } from "redis";

export class RegularFetchSubscriber {
  async start() {
    const sectionStateRedis = Container.get(SECTION_STATE_REDIS) as RedisClient;
    const storeTrackerService = Container.get(StoreTrackerService);

    const sectionStates = await lrangeAsyncObject<ILatLng>(
      sectionStateRedis,
      SECTION_STATE_KEY,
      0,
      -1
    );

    let latLangsInput = sectionStates
      .filter(item => item.valid)
      .map(item => ({ lat: item.lat, lng: item.lng }));

    if (latLangsInput.length === 0) {
      logger.info(
        `Section states is empty. It will replaced by embedded data ${validLatLangs.length}`
      );
      latLangsInput = validLatLangs;
    }

    await storeTrackerService.fetchDataBatch({
      latLangs: latLangsInput,
      batchUnit: configs.fetchBatchSize,
      distance: configs.fetchDistance
    });
  }
}
