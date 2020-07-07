// @flow

import type {
  AddressUtxoFunc,
} from '../../lib/state-fetch/types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import type {
  Address, Addressing
} from '../../lib/storage/models/PublicDeriver/interfaces';
import { buildYoroiTransferTx as jormungandrFormatYoroiTx } from '../jormungandr/yoroiTransfer';
import { toSenderUtxos } from './utils';

export async function generateCip1852TransferTx(payload: {|
  addresses: Array<{| ...Address, ...Addressing |}>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  getUTXOsForAddresses: AddressUtxoFunc,
|}): Promise<TransferTx> {
  const senderUtxos = await toSenderUtxos(payload);

  const txRequest = {
    outputAddr: payload.outputAddr,
    keyLevel: payload.keyLevel,
    signingKey: payload.signingKey,
    senderUtxos,
  };
  return jormungandrFormatYoroiTx({
    ...txRequest,
    useLegacyWitness: false,
  });
}
