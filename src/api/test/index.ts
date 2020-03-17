import express from "express";
import { syncStoreInfo } from "./test.controller";

const router = express.Router();

router.get("/syncStoreInfo", syncStoreInfo);

export default router;
