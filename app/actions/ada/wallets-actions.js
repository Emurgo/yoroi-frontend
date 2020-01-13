// @flow
import BigNumber from 'bignumber.js';
import { AsyncAction, Action } from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/transactions/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type {
  IGetLastSyncInfoResponse,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

// ======= WALLET ACTIONS =======

export default class WalletsActions {
  createWallet: AsyncAction<{| name: string, password: string |}> = new AsyncAction();
  restoreWallet: AsyncAction<{|
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string
  |}> = new AsyncAction();
  sendMoney: AsyncAction<{|
    signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
    password: string,
  |}> = new AsyncAction();
  updateBalance: Action<BigNumber> = new Action();
  updateLastSync: Action<IGetLastSyncInfoResponse> = new Action();
}
