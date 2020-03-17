import { Container } from "typedi";
import { StoreTrackerService } from "../../services/storeTrackerService";
import { validLatLangs } from "../../data";
import configs from "../../configs";
import express from "express";

export const syncStoreInfo = async (req: express.Request, res: express.Response) => {
  try {
    const storeTrackerService = Container.get(StoreTrackerService);

    const newStores = await storeTrackerService.fetchDataBatch({
      latLangs: validLatLangs,
      batchUnit: configs.fetchBatchSize,
      distance: configs.fetchDistance
    });

    res.json({ stores: newStores.slice(0, 10) });
  } catch (err) {
    res.status(500).send();
  }
};
