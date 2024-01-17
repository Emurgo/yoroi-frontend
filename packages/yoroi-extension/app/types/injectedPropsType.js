// @flow
import type { StoresMap } from '../stores/index';
import type { ActionsMap } from '../actions/index';
import type { StoresMap as StoresConnectorMap } from '../connector/stores/index';
import type { ActionsMap as ActionsConnectorMap } from '../connector/actions/index';

export type InjectedProps = {|
  +stores: StoresMap,
  +actions: ActionsMap,
|};

// <TODO:PENDING_REMOVAL> generated
type GeneratedProps<T> = {|
  +generated: T,
|};

// <TODO:PENDING_REMOVAL> generated
export type InjectedOrGenerated<T> = InjectedProps | GeneratedProps<T>;

// DAPP CONNECTOR
export type InjectedConnectorProps = {|
  +stores: StoresConnectorMap,
  +actions: ActionsConnectorMap,
|};

// <TODO:PENDING_REMOVAL> generated
export type InjectedOrGeneratedConnector<T> = InjectedConnectorProps | GeneratedProps<T>;

export type JointInjectedProps = {|
  +stores: StoresMap | StoresConnectorMap,
  +actions: ActionsMap | ActionsConnectorMap,
|};

// <TODO:PENDING_REMOVAL> generated
export type JointInjectedOrGenerated<T> = JointInjectedProps | GeneratedProps<T>;
