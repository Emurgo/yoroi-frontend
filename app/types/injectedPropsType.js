// @flow
import type { StoresMap } from '../stores/index';
import type { ActionsMap } from '../actions/index';
import type { StoresMap as StoresConnectorMap } from '../ergo-connector/stores/index';
import type { ActionsMap as ActionsConnectorMap } from '../ergo-connector/actions/index';

type InjectedProps = {|
  +stores: StoresMap,
  +actions: ActionsMap,
|};

type GeneratedProps<T> = {|
  +generated: T,
|};

export type InjectedOrGenerated<T> = InjectedProps | GeneratedProps<T>;

// ERGO CONNECTOR
type InjectedConnectorProps = {|
  +stores: StoresConnectorMap,
  +actions: ActionsConnectorMap,
|};

type GeneratedConnectorProps<T> = {|
  +generated: T,
|};
export type InjectedOrGeneratedConnector<T> = InjectedConnectorProps | GeneratedConnectorProps<T>;
