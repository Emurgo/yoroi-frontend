// @flow
import type { StoresMap } from '../stores/index';
import type { StoresMap as StoresConnectorMap } from '../connector/stores/index';

export type StoresAndActionsProps = {|
  +stores: StoresMap,
|};

// DAPP CONNECTOR
export type ConnectorStoresAndActionsProps = {|
  +stores: StoresConnectorMap,
|};
