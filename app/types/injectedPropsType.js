// @flow
import type { Node } from 'react';
import type { StoresMap } from '../stores/index';
import type { ActionsMap } from '../actions/index';

export type InjectedProps = {|
  +stores: StoresMap,
  +actions: ActionsMap,
|};

export type GeneratedProps<T> = {|
  +generated: T,
|};

export type InjectedOrGenerated<T> = InjectedProps | GeneratedProps<T>;

export type InjectedContainerProps = {|
  ...InjectedProps,
  +children?: Node,
|};

export type InjectedDialogContainerProps = {|
  ...InjectedContainerProps,
  +onClose: void => void,
  +classicTheme: boolean
|};
