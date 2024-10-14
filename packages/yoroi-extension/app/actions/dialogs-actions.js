// @flow
import { Action } from './lib/Action';

// ======= DIALOGS ACTIONS =======

export default class DialogsActions {
  open: Action<{| dialog: Function, params?: Object |}> = new Action();
  closeActiveDialog: Action<void> = new Action();
}
