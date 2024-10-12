// @flow
import TrezorSendActions from './trezor-send-actions';
import LedgerSendActions from './ledger-send-actions';

export type AdaActionsMap = {|
  trezorSend: TrezorSendActions,
  ledgerSend: LedgerSendActions,
|};

const adaActionsMap: AdaActionsMap = Object.freeze({
  trezorSend: new TrezorSendActions(),
  ledgerSend: new LedgerSendActions(),
});

export default adaActionsMap;
