// @flow
import type { StoresMap } from '../stores/index';
import type { ActionsMap } from '../actions/index';

type InjectedProps = {|
  +stores: StoresMap,
  +actions: ActionsMap,
|};

type GeneratedProps<T> = {|
  +generated: T,
|};

export type InjectedOrGenerated<T> = InjectedProps | GeneratedProps<T>;
