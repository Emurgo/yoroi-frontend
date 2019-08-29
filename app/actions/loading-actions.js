// @flow
import Action from './lib/Action';
import type { ExplorerType } from '../domain/Explorer';

// ======= PROFILE ACTIONS =======

export default class LoadingActions {
  redirect: Action<void> = new Action();
}
