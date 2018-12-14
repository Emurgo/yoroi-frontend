// @flow
import type { WalletType } from '../types/WalletType';

export const WalletTypeOption : {
    WEB_WALLET: WalletType,
    HARDWARE_WALLET: WalletType
} = {
  WEB_WALLET: 'CWTWeb',
  HARDWARE_WALLET: 'CWTHardware'
};

export const TrezorT = {
  vendor: 'trezor.io',
  model: 'T'
};
