// @flow
import BigNumber from 'bignumber.js';
import { Action } from './lib/Action';
import type {
  IGetLastSyncInfoResponse,
} from '../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { WalletWithCachedMeta } from '../stores/toplevel/WalletStore';

// ======= WALLET ACTIONS =======

export default class WalletsActions {
  updateBalance: Action<{|
    balance: BigNumber,
    publicDeriver: WalletWithCachedMeta,
  |}> = new Action();
  updateLastSync: Action<{|
    lastSync: IGetLastSyncInfoResponse,
    publicDeriver: WalletWithCachedMeta,
  |}> = new Action();
  unselectWallet: Action<void> = new Action();
}
