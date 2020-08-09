// @flow
import { AsyncAction, Action } from '../lib/Action';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export type SendUsingLedgerParams = {|
  signRequest: HaskellShelleyTxSignRequest,
|};

// ======= Sending ADA using Ledger ACTIONS =======

export default class LedgerSendActions {
  init: Action<void> = new Action();
  cancel: Action<void> = new Action();
  sendUsingLedger: AsyncAction<{|
    params: SendUsingLedgerParams,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
}
