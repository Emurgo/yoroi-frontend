// @flow
import WalletsActions from './wallets-actions';
import PaperWalletsActions from './paper-wallets-actions';
import TransactionsActions from './transactions-actions';
import WalletSettingsActions from './wallet-settings-actions';
import AddressesActions from './addresses-actions';
import DaedalusTransferActions from './daedalus-transfer-actions';
import HWConnectActions from './hw-connect-actions';
import TrezorSendActions from './trezor-send-actions';
import AdaRedemptionActions from './ada-redemption-actions';
import LedgerSendActions from './ledger-send-actions';

export type AdaActionsMap = {
  adaRedemption: AdaRedemptionActions,
  wallets: WalletsActions,
  paperWallets: PaperWalletsActions,
  transactions: TransactionsActions,
  walletSettings: WalletSettingsActions,
  addresses: AddressesActions,
  daedalusTransfer: DaedalusTransferActions,
  trezorConnect: HWConnectActions,
  trezorSend: TrezorSendActions,
  ledgerConnect: HWConnectActions,
  ledgerSend: LedgerSendActions,
};

const adaActionsMap: AdaActionsMap = {
  adaRedemption: new AdaRedemptionActions(),
  wallets: new WalletsActions(),
  paperWallets: new PaperWalletsActions(),
  transactions: new TransactionsActions(),
  walletSettings: new WalletSettingsActions(),
  addresses: new AddressesActions(),
  daedalusTransfer: new DaedalusTransferActions(),
  trezorConnect: new HWConnectActions(),
  trezorSend: new TrezorSendActions(),
  ledgerConnect: new HWConnectActions(),
  ledgerSend: new LedgerSendActions(),
};

export default adaActionsMap;
