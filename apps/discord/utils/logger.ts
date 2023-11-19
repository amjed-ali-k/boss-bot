import pino from "pino";

const logger = pino();
export default logger;

export const log = logger.info;
