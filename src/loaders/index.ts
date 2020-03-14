import expressLoader from "./express";
import influxLoader from "./influxdb";
import bullLoader from "./bull";
import dependencyInjectorLoader from "./dependencyInjector";
import redisLoader from "./redis";
import jobsLoader from "./jobs";
import { Application } from "express";
import logger from "./logger";

export default async (app: Application) => {
  const redisSets = redisLoader();
  logger.info("🔥  Redis is loaded");

  const influx = await influxLoader();
  logger.info("🔥  Influx is loaded");

  dependencyInjectorLoader({ redisSets, influx });

  const bull = bullLoader();
  logger.info("🔥  Bull is loaded");

  // Set workers
  jobsLoader(bull);

  expressLoader(app);
  logger.info("🔥  Express Server is prepared");

  app.get("/status", (req, res) => {
    res.status(200).end();
  });
  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  return app;
};
