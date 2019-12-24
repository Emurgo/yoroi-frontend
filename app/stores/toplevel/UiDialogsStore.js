// @flow
import { observable, action } from 'mobx';
import Store from '../base/Store';

/** Manages the open dialog window in Yoroi.
 * Note: There can only be one open dialog at a time
 */
export default class UiDialogsStore extends Store {

  @observable activeDialog: ?Function = null;
  @observable secondsSinceActiveDialogIsOpen: number = 0;

  /** Arbitrary data that may be used to render the dialog */
  @observable dataForActiveDialog: Object = {};
  @observable paramsForActiveDialog: Object = {};

  _secondsTimerInterval: ?IntervalID = null;

  setup(): void {
    this.actions.dialogs.open.listen(this._onOpen);
    this.actions.dialogs.closeActiveDialog.listen(this._onClose);
    this.actions.dialogs.resetActiveDialog.listen(this._reset);
    this.actions.dialogs.updateDataForActiveDialog.listen(this._onUpdateDataForActiveDialog);
  }

  isOpen: Function => boolean = (
    dialog: Function
  ): boolean => (this.activeDialog
    ? this.activeDialog.name === dialog.name
    : false);

  getParam: <T>(number | string) => T = <T>(
    key: (number | string)
  ): T => this.paramsForActiveDialog[key];

  countdownSinceDialogOpened: number => number = (
    countDownTo: number
  ): number => (
    Math.max(countDownTo - this.secondsSinceActiveDialogIsOpen, 0)
  );

  @action _onOpen = ({ dialog, params } : {| dialog : Function, params?: Object |}) => {
    this._reset();
    this.activeDialog = dialog;
    this.paramsForActiveDialog = params || {};
    this.dataForActiveDialog = observable.box(dialog.defaultProps);
    this.secondsSinceActiveDialogIsOpen = 0;
    if (this._secondsTimerInterval) clearInterval(this._secondsTimerInterval);
    this._secondsTimerInterval = setInterval(this._updateSeconds, 1000);
  };

  @action _onClose = () => {
    this._reset();
  };

  @action _updateSeconds = () => {
    this.secondsSinceActiveDialogIsOpen += 1;
  };

  @action _onUpdateDataForActiveDialog = (data: { [key: string]: any }) => {
    Object.assign(this.dataForActiveDialog, data);
  };

  @action _reset = () => {
    this.activeDialog = null;
    this.secondsSinceActiveDialogIsOpen = 0;
    this.dataForActiveDialog = {};
  };

}
