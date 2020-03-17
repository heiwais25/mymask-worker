import "reflect-metadata";
import express from "express";
import loaders from "./loaders";
import configs from "./configs";
import logger from "./loaders/logger";

const serverStart = async () => {
  const app = express();

  await loaders(app);

  app.listen(configs.port, () => {
    logger.info(`🔥  Server is running on the port ${configs.port}`);
  });
};

serverStart();
