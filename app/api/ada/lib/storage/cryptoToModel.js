// @flow
import moment from 'moment';

import type {
  AddressType,
  AdaWallet,
  AdaAddress,
  AdaWalletInitData,
  AdaHardwareWalletInitData
} from '../../adaTypes';
import { AdaWalletTypeOption } from './AdaTypesConfig';

/** Convert uesr-inputted data during wallet creation to internal web wallet representation */
export function toAdaWallet(walletInitData : AdaWalletInitData): AdaWallet {
  const { cwAssurance, cwName, cwUnit } = walletInitData.cwInitMeta;
  return {
    cwAmount: {
      getCCoin: '0'
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
}

/** Convert uesr-inputted data during wallet creation to internal hardware wallet representation */
export function toAdaHardwareWallet(walletInitData : AdaHardwareWalletInitData): AdaWallet {
  const { cwAssurance, cwName, cwUnit } = walletInitData.cwInitMeta;
  return {
    cwAmount: {
      getCCoin: '0'
    },
    cwId: '1',
    cwMeta: {
      cwAssurance,
      cwName,
      cwUnit
    },
    cwType: AdaWalletTypeOption.HARDWARE_WALLET,
    cwPassphraseLU: moment().format(),
    cwHardwareInfo: walletInitData.cwHardwareInfo,
  };
}

export function toAdaAddress(
  accountIndex: number,
  addressType: AddressType,
  addressIndex: number,
  addresHash: string
): AdaAddress {
  return {
    cadAmount: {
      getCCoin: '0'
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
