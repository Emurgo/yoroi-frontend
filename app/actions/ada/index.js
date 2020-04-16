// @flow
import AdaWalletsActions from './ada-wallets-actions';
import PaperWalletsActions from './paper-wallets-actions';
import TransactionsActions from './transactions-actions';
import WalletSettingsActions from './wallet-settings-actions';
import AddressesActions from './addresses-actions';
import DaedalusTransferActions from './daedalus-transfer-actions';
import YoroiTransferActions from './yoroi-transfer-actions';
import HWConnectActions from './hw-connect-actions';
import TrezorSendActions from './trezor-send-actions';
import TxBuilderActions from './tx-builder-actions';
import LedgerSendActions from './ledger-send-actions';
import HWVerifyAddressActions from './hw-verify-address-actions';
import WalletRestoreActions from './wallet-restore-actions';
import DelegationTransactionActions from './delegation-transaction-actions';
import DelegationActions from './delegation-actions';

export type AdaActionsMap = {|
  txBuilderActions: TxBuilderActions,
  wallets: AdaWalletsActions,
  paperWallets: PaperWalletsActions,
  transactions: TransactionsActions,
  walletSettings: WalletSettingsActions,
  addresses: AddressesActions,
  daedalusTransfer: DaedalusTransferActions,
  yoroiTransfer: YoroiTransferActions,
  trezorConnect: HWConnectActions,
  trezorSend: TrezorSendActions,
  ledgerConnect: HWConnectActions,
  ledgerSend: LedgerSendActions,
  hwVerifyAddress: HWVerifyAddressActions,
  walletRestore: WalletRestoreActions,
  delegationTransaction: DelegationTransactionActions,
  delegation: DelegationActions,
|};

const adaActionsMap: AdaActionsMap = {
  txBuilderActions: new TxBuilderActions(),
  wallets: new AdaWalletsActions(),
  paperWallets: new PaperWalletsActions(),
  transactions: new TransactionsActions(),
  walletSettings: new WalletSettingsActions(),
  addresses: new AddressesActions(),
  daedalusTransfer: new DaedalusTransferActions(),
  yoroiTransfer: new YoroiTransferActions(),
  trezorConnect: new HWConnectActions(),
  trezorSend: new TrezorSendActions(),
  ledgerConnect: new HWConnectActions(),
  ledgerSend: new LedgerSendActions(),
  hwVerifyAddress: new HWVerifyAddressActions(),
  walletRestore: new WalletRestoreActions(),
  delegationTransaction: new DelegationTransactionActions(),
  delegation: new DelegationActions(),
};

export default adaActionsMap;
