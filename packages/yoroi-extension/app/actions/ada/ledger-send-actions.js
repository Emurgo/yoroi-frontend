// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import type { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type {
  Addressing,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

export type SendUsingLedgerParams = {|
  signRequest: ISignRequest<any>,
|};

// ======= Sending ADA using Ledger ACTIONS =======

export default class LedgerSendActions {
  init: Action<void> = new Action();
  cancel: Action<void> = new Action();
  sendUsingLedgerWallet: AsyncAction<{|
    params: SendUsingLedgerParams,
    publicDeriver: PublicDeriver<>,
    onSuccess?: void => void,
  |}> = new AsyncAction();
  sendUsingLedgerKey: AsyncAction<{|
    signRequest: HaskellShelleyTxSignRequest,
    publicKey: {|
      key: RustModule.WalletV4.Bip32PublicKey,
      ...Addressing,
    |},
    publicDeriver: PublicDeriver<>,
    addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
    expectedSerial: string | void,
  |}> = new AsyncAction();
}
