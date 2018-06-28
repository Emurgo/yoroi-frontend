// @flow
const logger = console;

export const Logger = {

  debug: (data: string) => {
    logger.debug(data);
  },

  info: (data: string) => {
    logger.info(data);
  },

  error: (data: string) => {
    logger.error(data);
  },

  warn: (data: string) => {
    logger.info(data);
  },

};

// ========== STRINGIFY =========

export const stringifyData = (data: any) => JSON.stringify(data, null, 2);

export const stringifyError = (error: any) => (
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
);
