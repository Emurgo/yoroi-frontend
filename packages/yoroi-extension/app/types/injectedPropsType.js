// @flow
import type { StoresMap } from '../stores/index';
import type { ActionsMap } from '../actions/index';
import type { StoresMap as StoresConnectorMap } from '../connector/stores/index';
import type { ActionsMap as ActionsConnectorMap } from '../connector/actions/index';

export type InjectedProps = {|
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

export type InjectedOrGeneratedConnector<T> = InjectedConnectorProps | GeneratedProps<T>;

type JointInjectedProps = {|
  +stores: StoresMap | StoresConnectorMap,
  +actions: ActionsMap | ActionsConnectorMap,
|};
export type JointInjectedOrGenerated<T> = JointInjectedProps | GeneratedProps<T>;
