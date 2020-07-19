// @flow
import { AsyncAction, } from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/transactions/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

// ======= WALLET ACTIONS =======

export default class JormungandrWalletsActions {
  createWallet: AsyncAction<{| name: string, password: string |}> = new AsyncAction();
  sendMoney: AsyncAction<{|
    signRequest: BaseSignRequest<RustModule.WalletV3.InputOutput>,
    password: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
}
