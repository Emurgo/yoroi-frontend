// @flow
import { observable, action } from 'mobx';
import Store from './Store';

export default class WalletSettingsStore extends Store {

  @observable walletFieldBeingEdited: string | null = null;
  @observable lastUpdatedWalletField: string | null = null;

  @action _startEditingWalletField: {| field: string |} => void = (
    { field }
  ) => {
    this.walletFieldBeingEdited = field;
  };

  @action _stopEditingWalletField: void => void = () => {
    if (this.walletFieldBeingEdited != null) {
      this.lastUpdatedWalletField = this.walletFieldBeingEdited;
    }
    this.walletFieldBeingEdited = null;
  };

  @action _cancelEditingWalletField: void => void = () => {
    this.lastUpdatedWalletField = null;
    this.walletFieldBeingEdited = null;
  };

}
