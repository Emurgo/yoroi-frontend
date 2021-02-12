// @flow

import type { RemoteUnspentOutput } from '../state-fetch/types';
import type {
  Address, Value, Addressing,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';


export type JormungandrAddressedUtxo = {|
  ...RemoteUnspentOutput,
  ...Addressing,
|};

export type V3UnsignedTxUtxoResponse = {|
  senderUtxos: Array<RemoteUnspentOutput>,
  IOs: RustModule.WalletV3.InputOutput,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type V3UnsignedTxAddressedUtxoResponse = {|
  senderUtxos: Array<JormungandrAddressedUtxo>,
  IOs: RustModule.WalletV3.InputOutput,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
  certificate: void | RustModule.WalletV3.Certificate,
|};
