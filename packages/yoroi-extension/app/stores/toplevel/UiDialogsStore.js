// @flow
import { computed, observable, action, } from 'mobx';
import Store from '../base/Store';
import DialogsActions from '../../actions/dialogs-actions';

type DialogEntry = {|
  dialog: any,
  /**
   * Arbitrary data that can change at any time
   * NOT inherited when opening a new dialog (ex: 2nd dialog has its own data)
   * There are two main uses for this
   * 1) Statically set data for a Storybook tests to inject data
   * 2) Let a parent component know about a modification to a field inside the dialog
   *    Ex: When a field updates, it updates this field
   *    So that the parent can react to the data change
   */
  dataForActiveDialog: Map<string | number, any>,
  /**
  * Arbitrary data set at dialog-open-time
  * IS inherited when opening a new dialog (ex: 2nd dialog has shallow copy of data of 1st dialog)
  * This can be used to set the context in which this dialog was opened
  * ex: chose this option in a menu dialog
  */
  paramsForActiveDialog: Map<string | number, any>,
|};

/** Manages the open dialog window in Yoroi.
 * Note: There can only be one open dialog at a time
 */
export default class UiDialogsStore<
  TStores,
  TActions: { dialogs: DialogsActions, ... },
> extends Store<TStores, TActions>
{

  @observable dialogList: Array<DialogEntry> = [];

  @observable secondsSinceActiveDialogIsOpen: number = 0;

  _secondsTimerInterval: ?IntervalID = null;

  setup(): void {
    super.setup();
    this.actions.dialogs.open.listen(this._onOpen);
    this.actions.dialogs.push.listen(this._onPush);
    this.actions.dialogs.pop.listen(this._onPop);
    this.actions.dialogs.closeActiveDialog.listen(this._onClose);
    this.actions.dialogs.resetActiveDialog.listen(this._reset);
    this.actions.dialogs.updateDataForActiveDialog.listen(this._onUpdateDataForActiveDialog);
  }

  @computed
  get hasOpen(): boolean {
    return this.dialogList.length > 0;
  }

  isOpen: any => boolean = (
    dialog: any
  ): boolean => (
    this.dialogList[this.dialogList.length - 1]?.dialog === dialog
  )

  getParam: <T>(number | string) => (void | T) = <T>(
    key: (number | string)
  ): (void | T) => (
    this.dialogList[this.dialogList.length - 1]?.paramsForActiveDialog.get(key)
  );

  getActiveData: <T>(number | string) => (void | T) = <T>(
    key: (number | string)
  ): (void | T) => (
    this.dialogList[this.dialogList.length - 1]?.dataForActiveDialog.get(key)
  );

  countdownSinceDialogOpened: number => number = (
    countDownTo: number
  ): number => (
    Math.max(countDownTo - this.secondsSinceActiveDialogIsOpen, 0)
  );

  @action _onPush: {| dialog : any, params?: {...} |} => void = ({ dialog, params }) => {
    const prevEntry = this.dialogList[this.dialogList.length - 1];

    const newMap = observable.map();
    newMap.merge(prevEntry);
    newMap.merge(params);
    this.dialogList.push({
      dialog,
      paramsForActiveDialog: newMap,
      dataForActiveDialog: observable.map(),
    });
    this.secondsSinceActiveDialogIsOpen = 0;
    if (this._secondsTimerInterval) clearInterval(this._secondsTimerInterval);
    this._secondsTimerInterval = setInterval(this._updateSeconds, 1000);
  };
  @action _onPop: void => void = () => {
    this.dialogList.pop();
  }
  @action _onOpen: {| dialog : any, params?: {...} |} => void = ({ dialog, params }) => {
    this._reset();
    this._onPush({
      dialog,
      params,
    });
  };

  @action _onClose: void => void = () => {
    this._reset();
  };

  @action _updateSeconds: void => void = () => {
    this.secondsSinceActiveDialogIsOpen += 1;
  };

  @action _onUpdateDataForActiveDialog: {| [key: string]: any, |} => void = (data) => {
    if (this.dialogList.length === 0) return;
    // $FlowExpectedError[prop-missing] this is a mobx property -- not part of es6
    this.dialogList[this.dialogList.length - 1].dataForActiveDialog.merge(data);
  };

  @action _reset: void => void = () => {
    this.dialogList.splice(0); // remove all elements. Need this to trigger mobx reaction
    this.secondsSinceActiveDialogIsOpen = 0;
  };

}
