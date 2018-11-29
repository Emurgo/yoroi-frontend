// @flow
import WalletsActions from './wallets-actions';
import TransactionsActions from './transactions-actions';
import WalletSettingsActions from './wallet-settings-actions';
import AddressesActions from './addresses-actions';
import DaedalusTransferActions from './daedalus-transfer-actions';
import TrezorConnectActions from './trezor-connect-actions';

export type AdaActionsMap = {
  wallets: WalletsActions,
  transactions: TransactionsActions,
  walletSettings: WalletSettingsActions,
  addresses: AddressesActions,
  daedalusTransfer: DaedalusTransferActions,
  trezorConnect: TrezorConnectActions,
};

const adaActionsMap: AdaActionsMap = {
  wallets: new WalletsActions(),
  transactions: new TransactionsActions(),
  walletSettings: new WalletSettingsActions(),
  addresses: new AddressesActions(),
  daedalusTransfer: new DaedalusTransferActions(),
  trezorConnect: new TrezorConnectActions(),
};

export default adaActionsMap;
