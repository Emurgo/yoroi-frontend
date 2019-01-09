// @flow
import { observable, computed } from 'mobx';
import BigNumber from 'bignumber.js';
import type { AssuranceMode, AssuranceModeOption } from '../types/transactionAssuranceTypes';
import { assuranceModes, assuranceModeOptions } from '../config/transactionAssuranceConfig';

export default class Wallet {

  id: string = '';
  address: string = 'current address';
  @observable name: string = '';
  @observable amount: BigNumber;
  @observable assurance: AssuranceModeOption;
  @observable passwordUpdateDate: ?Date;
  @observable hasPassword: boolean;

  constructor(data: {
    id: string,
    name: string,
    amount: BigNumber,
    assurance: AssuranceModeOption,
    passwordUpdateDate: ?Date,
    hasPassword: boolean,
  }) {
    Object.assign(this, data);
  }

  updateAmount(amount: BigNumber): void {
    this.amount = amount;
  }

  @computed get assuranceMode(): AssuranceMode {
    switch (this.assurance) {
      case assuranceModeOptions.NORMAL: return assuranceModes.NORMAL;
      case assuranceModeOptions.STRICT: return assuranceModes.STRICT;
      default: return assuranceModes.NORMAL;
    }
  }

}
