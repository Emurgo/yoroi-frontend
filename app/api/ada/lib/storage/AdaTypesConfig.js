// @flow
import type { AdaWalletType } from '../../adaTypes';

export const AdaWalletTypeOption : {
  WEB_WALLET: AdaWalletType,
  HARDWARE_WALLET: AdaWalletType
} = {
  WEB_WALLET: 'CWTWeb', // this should be used as default WalletTypeInfo
  HARDWARE_WALLET: 'CWTHardware'
};
