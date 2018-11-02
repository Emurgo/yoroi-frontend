// @flow
import { observable, computed } from 'mobx';
import BigNumber from 'bignumber.js';
import type { AssuranceMode, AssuranceModeOption } from '../types/transactionAssuranceTypes';
import { assuranceModes, assuranceModeOptions } from '../config/transactionAssuranceConfig';
import type { WalletType, WalletHardwareInfo } from '../types/WalletType';
import { WalletTypeOption } from '../config/WalletTypeConfig';

export default class Wallet {

  id: string = '';
  address: string = 'current address';
  type : WalletType = WalletTypeOption.WEB_WALLET;
  hardwareInfo : ?WalletHardwareInfo;
  @observable name: string = '';
  @observable amount: BigNumber;
  @observable assurance: AssuranceModeOption;
  @observable passwordUpdateDate: ?Date;

  /**
   * When creating Wallet object we can skip typeInfo,
   * in that case it will be by default CWTWeb type wallet
   *
   * @param {*} data
   */
  constructor(data: {
    id: string,
    name: string,
    type: WalletType;
    hardwareInfo: ?WalletHardwareInfo;
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
