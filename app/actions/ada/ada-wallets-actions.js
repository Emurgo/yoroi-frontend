// @flow
import BigNumber from 'bignumber.js';
import { AsyncAction, Action } from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/transactions/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type {
  IGetLastSyncInfoResponse,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

// ======= WALLET ACTIONS =======

export default class AdaWalletsActions {
  createWallet: AsyncAction<{| name: string, password: string |}> = new AsyncAction();
  restoreWallet: AsyncAction<{|
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string
  |}> = new AsyncAction();
  sendMoney: AsyncAction<{|
    signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
    password: string,
    publicDeriver: PublicDeriverWithCachedMeta,
  |}> = new AsyncAction();
  updateBalance: Action<{|
    balance: BigNumber,
    publicDeriver: PublicDeriverWithCachedMeta,
  |}> = new Action();
  updateLastSync: Action<{|
    lastSync: IGetLastSyncInfoResponse,
    publicDeriver: PublicDeriverWithCachedMeta,
  |}> = new Action();
}
