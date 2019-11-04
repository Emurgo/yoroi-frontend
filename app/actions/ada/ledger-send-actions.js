// @flow
import Action from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/transactions/types';

export type SendUsingLedgerParams = {
  signRequest: BaseSignRequest,
};

// ======= Sending ADA using Ledger ACTIONS =======

export default class LedgerSendActions {
  init: Action<void> = new Action();
  cancel: Action<void> = new Action();
  sendUsingLedger: Action<SendUsingLedgerParams> = new Action();
}
