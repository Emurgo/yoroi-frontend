// @flow

import type { RemoteUnspentOutput } from '../state-fetch/types';
import { Transaction } from '@coinbarn/ergo-ts';
import type {
  Address, Value, Addressing,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';

export type ErgoAddressedUtxo = {|
  ...RemoteUnspentOutput,
  ...Addressing,
|};

export type ErgoUnsignedTxUtxoResponse = {|
  senderUtxos: Array<RemoteUnspentOutput>,
  unsignedTx: Transaction,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type ErgoUnsignedTxAddressedUtxoResponse = {|
  senderUtxos: Array<ErgoAddressedUtxo>,
  unsignedTx: Transaction,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
