// @flow

import { isEmpty } from 'lodash';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import {
  NoInputsError,
} from '../../errors';
import type { AddressedUtxo } from '../types';
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

/**
 * Generate transaction including all addresses with no change.
*/
export async function toSenderUtxos(payload: {|
  addresses: Array<{| ...Address, ...Addressing |}>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  getUTXOsForAddresses: AddressUtxoFunc,
|}): Promise<Array<AddressedUtxo>> {
  // fetch UTXO
  const utxos = await payload.getUTXOsForAddresses({
    addresses: payload.addresses.map(addr => addr.address)
  });

  // add addressing info to the UTXO
  const addressingMap = new Map<string, Addressing>(
    payload.addresses.map(entry => [
      entry.address,
      { addressing: entry.addressing }
    ])
  );
  const senderUtxos = utxos.map(utxo => {
    const addressing = addressingMap.get(utxo.receiver);
    if (addressing == null) {
      throw new Error('should never happen');
    }
    return {
      ...utxo,
      addressing: addressing.addressing
    };
  });

  if (isEmpty(utxos)) {
    const error = new NoInputsError();
    Logger.error(`legacyYoroi::${nameof(toSenderUtxos)} ${stringifyError(error)}`);
    throw error;
  }

  return senderUtxos;
}

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
    : shelleyFormatYoroiTx(txRequest);
}
