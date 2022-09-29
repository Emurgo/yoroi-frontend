// @flow
import { Action } from './lib/Action';

// ======= WALLET ACTIONS =======

export default class ServerConnectionActions {
  parallelSyncStateChange: Action<void> = new Action();
}
