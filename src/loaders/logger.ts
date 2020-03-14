import log4js from "log4js";
const logger = log4js.getLogger();
logger.level = "debug";
logger.debug("Some debug messages");
export default logger;
