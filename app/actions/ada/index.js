// @flow
import AdaWalletsActions from './ada-wallets-actions';
import PaperWalletsActions from './paper-wallets-actions';
import WalletSettingsActions from './wallet-settings-actions';
import YoroiTransferActions from './yoroi-transfer-actions';
import HWConnectActions from './hw-connect-actions';
import TrezorSendActions from './trezor-send-actions';
import TxBuilderActions from './tx-builder-actions';
import LedgerSendActions from './ledger-send-actions';
import HWVerifyAddressActions from './hw-verify-address-actions';
import WalletRestoreActions from './wallet-restore-actions';

export type AdaActionsMap = {|
  txBuilderActions: TxBuilderActions,
  wallets: AdaWalletsActions,
  paperWallets: PaperWalletsActions,
  walletSettings: WalletSettingsActions,
  yoroiTransfer: YoroiTransferActions,
  trezorConnect: HWConnectActions,
  trezorSend: TrezorSendActions,
  ledgerConnect: HWConnectActions,
  ledgerSend: LedgerSendActions,
  hwVerifyAddress: HWVerifyAddressActions,
  walletRestore: WalletRestoreActions,
|};

const adaActionsMap: AdaActionsMap = Object.freeze({
  txBuilderActions: new TxBuilderActions(),
  wallets: new AdaWalletsActions(),
  paperWallets: new PaperWalletsActions(),
  walletSettings: new WalletSettingsActions(),
  yoroiTransfer: new YoroiTransferActions(),
  trezorConnect: new HWConnectActions(),
  trezorSend: new TrezorSendActions(),
  ledgerConnect: new HWConnectActions(),
  ledgerSend: new LedgerSendActions(),
  hwVerifyAddress: new HWVerifyAddressActions(),
  walletRestore: new WalletRestoreActions(),
});

export default adaActionsMap;
