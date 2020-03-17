import { Application } from "express";
import logger from "morgan";
import cors from "cors";

export default (express: Application) => {
  express.use(cors());

  if (process.env.NODE_ENV === "development") {
    express.use(logger("dev"));
  }

  express.get("/status", (_, res) => res.status(200).send());
  express.post("/status", (_, res) => res.status(200).send());
};
