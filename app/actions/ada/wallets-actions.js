// @flow
import BigNumber from 'bignumber.js';
import Action from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/transactions/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type {
  IGetLastSyncInfoResponse,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

// ======= WALLET ACTIONS =======

export default class WalletsActions {
  createWallet: Action<{| name: string, password: string |}> = new Action();
  restoreWallet: Action<{|
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string
  |}> = new Action();
  sendMoney: Action<{|
    signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
    password: string,
  |}> = new Action();
  updateBalance: Action<BigNumber> = new Action();
  updateLastSync: Action<IGetLastSyncInfoResponse> = new Action();
}
