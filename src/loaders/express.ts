import { Express, Application } from "express";
import logger from "morgan";
import cors from "cors";
// import api from "../api";
// import { uploadMiddleware, uploadController } from "../rest/upload";

export default (express: Application) => {
  express.use(cors());
  express.use(logger("dev"));

  // Set server response

  //   express.use("/api", api);
  // Set uploader
};
