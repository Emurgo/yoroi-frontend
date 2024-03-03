// @flow

import Store from '../base/Store';
import type { ActionsMap } from '../../actions';
import type { StoresMap } from '../index';
import { action, observable } from 'mobx';

export default class SwapStore extends Store<StoresMap, ActionsMap> {

  @observable limitOrderDisplayValue: string = '';

  @action setLimitOrderDisplayValue: string => void = (val: string) => {
    console.log('[setLimitOrderDisplayValue]', val);
    this.limitOrderDisplayValue = val;
  }

  @action resetLimitOrderDisplayValue: void => void = () => {
    this.limitOrderDisplayValue = '';
  }
}