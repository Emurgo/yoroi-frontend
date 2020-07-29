// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/transactions/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export type SendUsingLedgerParams = {|
  signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder>,
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
