// @flow
import AdaApi from './ada/index';
import LocalStorageApi from './localStorage/index';
import ExportApi from './export/index';

export type Api = {
  ada: AdaApi,
  localStorage: LocalStorageApi,
  export: ExportApi,
};

export const setupApi = (): Api => ({
  ada: new AdaApi(),
  localStorage: new LocalStorageApi(),
  export: new ExportApi(),
});
