// @flow

import type { RemoteUnspentOutput } from '../state-fetch/types';
import type {
  Address, Value, Addressing,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

export type ErgoAddressedUtxo = {|
  ...RemoteUnspentOutput,
  ...Addressing,
|};

export type ErgoUnsignedTxUtxoResponse = {|
  senderUtxos: Array<RemoteUnspentOutput>,
  unsignedTx: RustModule.SigmaRust.TxBuilder,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type ErgoUnsignedTxAddressedUtxoResponse = {|
  senderUtxos: Array<ErgoAddressedUtxo>,
  unsignedTx: RustModule.SigmaRust.TxBuilder,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
