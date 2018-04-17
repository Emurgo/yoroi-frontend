// @flow
import AdaApi from './ada/index';

export type Api = {
  ada: AdaApi,
};

export const setupApi = (): Api => ({
  ada: new AdaApi(),
});
