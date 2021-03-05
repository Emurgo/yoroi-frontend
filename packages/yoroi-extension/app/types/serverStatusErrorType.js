// @flow

export const ServerStatusErrors = {
  Server: 0,
  Network: 1,
  Healthy: 2,
};
export type ServerStatusErrorType = $Values<typeof ServerStatusErrors>;
