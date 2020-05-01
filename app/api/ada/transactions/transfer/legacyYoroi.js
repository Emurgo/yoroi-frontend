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
import { buildYoroiTransferTx as shelleyFormatYoroiTx } from '../shelley/yoroiTransfer';
import { buildYoroiTransferTx as legacyFormatYoroiTx } from '../byron/yoroiTransfer';
import { toSenderUtxos } from './utils';

export async function generateLegacyYoroiTransferTx(payload: {|
  addresses: Array<{| ...Address, ...Addressing |}>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  getUTXOsForAddresses: AddressUtxoFunc,
  legacy: boolean,
|}): Promise<TransferTx> {
  const { legacy, ...rest } = payload;
  const senderUtxos = await toSenderUtxos(rest);

  const txRequest = {
    outputAddr: payload.outputAddr,
    keyLevel: payload.keyLevel,
    signingKey: payload.signingKey,
    senderUtxos,
  };
  return legacy
    ? legacyFormatYoroiTx(txRequest)
    : shelleyFormatYoroiTx({
      ...txRequest,
      useLegacyWitness: true,
    });
}
