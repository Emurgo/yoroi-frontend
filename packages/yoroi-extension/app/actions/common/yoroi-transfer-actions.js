// @flow
import { AsyncAction, Action } from '../lib/Action';
import type {
  Address, Addressing
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';

export default class YoroiTransferActions {
  startTransferFunds: Action<void> = new Action();
  setupTransferFundsWithPaperMnemonic: Action<{|
    recoveryPhrase: string,
    paperPassword: string,
  |}> = new Action();
  checkAddresses: AsyncAction<{|
    getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
  |}> = new AsyncAction();
  backToUninitialized: Action<void> = new Action();
  transferFunds: AsyncAction<{|
    next: void => Promise<void>,
    network: $ReadOnly<NetworkRow>,
    getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
    rebuildTx: boolean,
  |}> = new AsyncAction();
  cancelTransferFunds: Action<void> = new Action();
}
