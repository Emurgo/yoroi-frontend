// @flow
import HWConnectActions from './hw-connect-actions';
import TrezorSendActions from './trezor-send-actions';
import LedgerSendActions from './ledger-send-actions';

export type AdaActionsMap = {|
  trezorConnect: HWConnectActions,
  trezorSend: TrezorSendActions,
  ledgerConnect: HWConnectActions,
  ledgerSend: LedgerSendActions,
|};

const adaActionsMap: AdaActionsMap = Object.freeze({
  trezorConnect: new HWConnectActions(),
  trezorSend: new TrezorSendActions(),
  ledgerConnect: new HWConnectActions(),
  ledgerSend: new LedgerSendActions(),
});

export default adaActionsMap;
