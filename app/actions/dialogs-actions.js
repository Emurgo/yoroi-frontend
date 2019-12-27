// @flow
import Action from './lib/Action';

// ======= DIALOGS ACTIONS =======

export default class DialogsActions {
  open: Action<{| dialog: Function, params?: Object |}> = new Action();
  updateDataForActiveDialog: Action<{ [key: string]: any }> = new Action();
  closeActiveDialog: Action<void> = new Action();
  resetActiveDialog: Action<void> = new Action();
}
