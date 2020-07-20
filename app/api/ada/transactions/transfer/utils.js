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

/**
 * merge in remote UTXO information into an address list
*/
export async function toSenderUtxos(payload: {|
  addresses: Array<{| ...Address, ...Addressing |}>,
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
    Logger.error(`utils::${nameof(toSenderUtxos)} ${stringifyError(error)}`);
    throw error;
  }

  return senderUtxos;
}
