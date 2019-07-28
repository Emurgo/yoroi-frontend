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
import TxBuilderActions from './tx-builder-actions';
import LedgerSendActions from './ledger-send-actions';
import HWVerifyAddressActions from './hw-verify-address-actions';

export type AdaActionsMap = {
  adaRedemption: AdaRedemptionActions,
  txBuilderActions: TxBuilderActions,
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
  hwVerifyAddress: HWVerifyAddressActions,
};

const adaActionsMap: AdaActionsMap = {
  adaRedemption: new AdaRedemptionActions(),
  txBuilderActions: new TxBuilderActions(),
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
  hwVerifyAddress: new HWVerifyAddressActions(),
};

export default adaActionsMap;
