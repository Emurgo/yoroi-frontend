// @flow
import type { StoresMap } from '../stores/index';
import type { ActionsMap } from '../actions/index';
import type { StoresMap as StoresConnectorMap } from '../connector/stores/index';
import type { ActionsMap as ActionsConnectorMap } from '../connector/actions/index';

export type InjectedProps = {|
  +stores: StoresMap,
  +actions: ActionsMap,
|};

// DAPP CONNECTOR
export type InjectedConnectorProps = {|
  +stores: StoresConnectorMap,
  +actions: ActionsConnectorMap,
|};

export type JointInjectedProps = {|
  +stores: StoresMap | StoresConnectorMap,
  +actions: ActionsMap | ActionsConnectorMap,
|};
