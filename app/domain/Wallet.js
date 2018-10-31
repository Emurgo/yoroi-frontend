// @flow
import { observable, computed } from 'mobx';
import BigNumber from 'bignumber.js';
import type { AssuranceMode, AssuranceModeOption } from '../types/transactionAssuranceTypes';
import type { WalletTypeInfo } from '../types/walletTypes';

export default class Wallet {

  id: string = '';
  address: string = 'current address';
  typeInfo : WalletTypeInfo;
  @observable name: string = '';
  @observable amount: BigNumber;
  @observable assurance: AssuranceModeOption;
  @observable passwordUpdateDate: ?Date;

  constructor(data: {
    id: string,
    name: string,
    typeInfo : WalletTypeInfo;
    amount: BigNumber,
    assurance: AssuranceModeOption,
    passwordUpdateDate: ?Date,
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
