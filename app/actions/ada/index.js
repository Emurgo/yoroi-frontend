// @flow
import WalletsActions from './wallets-actions';
import TransactionsActions from './transactions-actions';
import WalletSettingsActions from './wallet-settings-actions';
import AddressesActions from './addresses-actions';
import DaedalusTransferActions from './daedalus-transfer-actions';
import HWConnectActions from './hw-connect-actions';
import TrezorSendActions from './trezor-send-actions';
import AdaRedemptionActions from './ada-redemption-actions';

export type AdaActionsMap = {
  adaRedemption: AdaRedemptionActions,
  wallets: WalletsActions,
  transactions: TransactionsActions,
  walletSettings: WalletSettingsActions,
  addresses: AddressesActions,
  daedalusTransfer: DaedalusTransferActions,
  trezorConnect: HWConnectActions,
  trezorSend: TrezorSendActions,
};

const adaActionsMap: AdaActionsMap = {
  adaRedemption: new AdaRedemptionActions(),
  wallets: new WalletsActions(),
  transactions: new TransactionsActions(),
  walletSettings: new WalletSettingsActions(),
  addresses: new AddressesActions(),
  daedalusTransfer: new DaedalusTransferActions(),
  trezorConnect: new HWConnectActions(),
  trezorSend: new TrezorSendActions(),
};

export default adaActionsMap;
