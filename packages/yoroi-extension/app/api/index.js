// @flow
import CommonApi from './common/index';
import AdaApi from './ada/index';
import ErgoApi from './ergo/index';
import JormungandrApi from './jormungandr/index';
import LocalStorageApi from './localStorage/index';
import ExternalStorageApi from './externalStorage/index';
import ExportApi from './export/index';

export type Api = {|
  common: CommonApi,
  ada: AdaApi,
  ergo: ErgoApi,
  jormungandr: JormungandrApi,
  localStorage: LocalStorageApi,
  externalStorage: ExternalStorageApi,
  export: ExportApi,
|};

export const setupApi: void => Promise<Api> = async () => ({
  common: new CommonApi(),
  ada: new AdaApi(),
  ergo: new ErgoApi(),
  jormungandr: new JormungandrApi(),
  localStorage: new LocalStorageApi(),
  externalStorage: new ExternalStorageApi(),
  export: new ExportApi(),
});

