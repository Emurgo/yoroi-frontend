// @flow
import { observable, computed } from 'mobx';
import BigNumber from 'bignumber.js';
import type { AssuranceMode, AssuranceModeOption } from '../types/transactionAssuranceTypes';
import { assuranceModes, assuranceModeOptions } from '../config/transactionAssuranceConfig';
import type { WalletType, WalletHardwareInfo } from '../types/WalletType';
import { WalletTypeOption, TrezorT } from '../config/WalletTypeConfig';

/** External representation of the internal Wallet in the API layer  */
export default class Wallet {

  id: string = '';
  address: string = 'current address';
  type: WalletType = WalletTypeOption.WEB_WALLET;
  hardwareInfo: ?WalletHardwareInfo;
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

  @computed get isWebWallet(): boolean {
    return this.type === WalletTypeOption.WEB_WALLET;
  }

  @computed get isHardwareWallet(): boolean {
    return this.type === WalletTypeOption.HARDWARE_WALLET;
  }

  @computed get isTrezorTWallet(): boolean {
    let result = false;
    if (this.isHardwareWallet
    && this.hardwareInfo
    && this.hardwareInfo.vendor === TrezorT.vendor
    && this.hardwareInfo.model === TrezorT.model) {
      result = true;
    }
    return result;
  }

  @computed get assuranceMode(): AssuranceMode {
    switch (this.assurance) {
      case assuranceModeOptions.NORMAL: return assuranceModes.NORMAL;
      case assuranceModeOptions.STRICT: return assuranceModes.STRICT;
      default: return assuranceModes.NORMAL;
    }
  }

}
