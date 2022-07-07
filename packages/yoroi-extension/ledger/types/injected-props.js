// @flow //
import type { Node } from 'react';
import RootStore from '../stores/index';

export type InjectedContainerProps = {|
  rootStore: RootStore,
  children?: Node,
|}
