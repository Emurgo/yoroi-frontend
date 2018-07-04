// @flow
import type {
  AdaWallet,
  AdaAddress,
  AdaWalletInitData
} from '../../adaTypes';

/* @note: Ada wallet is the abstraction for Daedalus */
export function toAdaWallet(walletInitData : AdaWalletInitData): AdaWallet {
  const { cwAssurance, cwName, cwUnit } = walletInitData.cwInitMeta;
  return {
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
    cwPassphraseLU: new Date()
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
  return 1; // addressType === 'Internal;
}
