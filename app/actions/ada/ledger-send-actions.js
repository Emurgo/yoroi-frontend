// @flow
import Action from '../lib/Action';

export type SendUsingLedgerParams = {
  receiver: string,
  amount: string
};

// ======= Sending ADA using Ledger ACTIONS =======

export default class LedgerSendActions {
  init: Action<void> = new Action();
  cancel: Action<void> = new Action();
  sendUsingLedger: Action<SendUsingLedgerParams> = new Action();
}
