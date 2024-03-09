// @flow

import Store from '../base/Store';
import type { ActionsMap } from '../../actions';
import type { StoresMap } from '../index';
import { action, observable } from 'mobx';
import type { StorageField } from '../../api/localStorage';
import { createStorageFlag } from '../../api/localStorage';

export default class SwapStore extends Store<StoresMap, ActionsMap> {

  @observable limitOrderDisplayValue: string = '';

  swapDisclaimerAcceptanceFlag: StorageField<boolean> =
    createStorageFlag('SwapStore.swapDisclaimerAcceptanceFlag', false);

  @action setLimitOrderDisplayValue: string => void = (val: string) => {
    this.limitOrderDisplayValue = val;
  }

  @action resetLimitOrderDisplayValue: void => void = () => {
    this.limitOrderDisplayValue = '';
  }
}