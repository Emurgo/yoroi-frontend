// @flow
import moment from 'moment';

import type {
  AdaWallet,
  AdaAddress,
  AdaWalletInitData,
  AdaHardwareWalletInitData
} from '../../adaTypes';
import { AdaWalletTypeOption } from '../../config/AdaTypesConfig';

/** Convert uesr-inputted data during wallet creation to internal wallet representation */
/** WEB_WALLET */
export function toAdaWallet(walletInitData : AdaWalletInitData): AdaWallet {
  const { cwAssurance, cwName, cwUnit } = walletInitData.cwInitMeta;
  const adaWebWallet: AdaWallet = {
    cwAccountsNumber: 1,
    cwAmount: {
      getCCoin: 0
    },
    cwId: '1',
    cwMeta: {
      cwAssurance,
      cwName,
      cwUnit
    },
    cwType: AdaWalletTypeOption.WEB_WALLET,
    cwPassphraseLU: moment().format(),
  };

  return adaWebWallet;
}

/** Convert uesr-inputted data during wallet creation to internal wallet representation */
/** HARDWARE_WALLET */
export function toAdaHardwareWallet(walletInitData : AdaHardwareWalletInitData ): AdaWallet {
  const { cwAssurance, cwName, cwUnit } = walletInitData.cwInitMeta;
  const adaHardwareWallet: AdaWallet = {
    cwAccountsNumber: 1,
    cwAmount: {
      getCCoin: 0
    },
    cwId: '1',
    cwMeta: {
      cwAssurance,
      cwName,
      cwUnit
    },
    cwType: AdaWalletTypeOption.HARDWARE_WALLET,
    cwHardwareInfo: walletInitData.cwHardwareInfo,
  };

  return adaHardwareWallet;
}

export function toAdaAddress(
  accountIndex: number,
  addressType: AddressType,
  addressIndex: number,
  addresHash: string
): AdaAddress {
  return {
    cadAmount: {
      getCCoin: 0
    },
    cadId: addresHash,
    cadIsUsed: false,
    account: accountIndex,
    change: getAddressTypeIndex(addressType),
    index: addressIndex
  };
}

export function getAddressTypeIndex(addressType: AddressType): number {
  if (addressType === 'External') return 0;
  return 1; // addressType === 'Internal';
}
