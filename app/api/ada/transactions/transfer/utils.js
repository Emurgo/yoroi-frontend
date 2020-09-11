// @flow

import { isEmpty } from 'lodash';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import {
  NoInputsError,
} from '../../../common/errors';
import type { AddressedUtxo } from '../types';
import type {
  AddressUtxoFunc,
} from '../../lib/state-fetch/types';
import type {
  Address, Addressing
} from '../../lib/storage/models/PublicDeriver/interfaces';
import type { NetworkRow } from '../../lib/storage/database/primitives/tables';

/**
 * merge in remote UTXO information into an address list
*/
export async function toSenderUtxos(payload: {|
  addresses: Array<{| ...Address, ...Addressing |}>,
  getUTXOsForAddresses: AddressUtxoFunc,
  network: $ReadOnly<NetworkRow>
|}): Promise<Array<AddressedUtxo>> {
  // fetch UTXO
  const utxos = await payload.getUTXOsForAddresses({
    addresses: payload.addresses.map(addr => addr.address),
    network: payload.network,
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
      throw new Error(`${nameof(toSenderUtxos)} should never happen ${utxo.receiver}`);
    }
    return {
      ...utxo,
      addressing: addressing.addressing
    };
  });

  if (isEmpty(utxos)) {
    const error = new NoInputsError();
    Logger.error(`utils::${nameof(toSenderUtxos)} ${stringifyError(error)}`);
    throw error;
  }

  return senderUtxos;
}
