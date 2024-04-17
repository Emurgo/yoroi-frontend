// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import type { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
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
    publicDeriverId: number,
    onSuccess?: void => void,
  |}> = new AsyncAction();
  sendUsingLedgerKey: AsyncAction<{|
    signRequest: HaskellShelleyTxSignRequest,
    publicKey: {|
      key: RustModule.WalletV4.Bip32PublicKey,
      ...Addressing,
    |},
    publicDeriverId: number,
    addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
    expectedSerial: string | void,
  |}> = new AsyncAction();
}
