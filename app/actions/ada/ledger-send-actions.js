// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/transactions/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type { WalletWithCachedMeta } from '../../stores/toplevel/WalletStore';

export type SendUsingLedgerParams = {|
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>,
|};

// ======= Sending ADA using Ledger ACTIONS =======

export default class LedgerSendActions {
  init: Action<void> = new Action();
  cancel: Action<void> = new Action();
  sendUsingLedger: AsyncAction<{|
    params: SendUsingLedgerParams,
    publicDeriver: WalletWithCachedMeta,
  |}> = new AsyncAction();
}
