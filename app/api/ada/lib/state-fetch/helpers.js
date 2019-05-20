// @flow

import _ from 'lodash';
import {
  GetAllUTXOsForAddressesError,
  GetTxsBodiesForUTXOsError
} from '../../errors';
import {
  Logger,
  stringifyError
} from '../../../../utils/logging';

import type {
  AddressUtxoFunc,
  TxBodiesFunc,
} from './types';

import type { ConfigType } from '../../../../../config/config-types';

declare var CONFIG: ConfigType;

/** Sum up the UTXO for a list of addresses by batching backend requests */
export function batchUTXOsForAddresses(
  getUTXOsForAddresses: AddressUtxoFunc,
): AddressUtxoFunc {
  return async function (body) {
    try {
      // split up all addresses into chunks of equal size
      const groupsOfAddresses = _.chunk(body.addresses, CONFIG.app.addressRequestSize);

      // convert chunks into list of Promises that call the backend-service
      const promises = groupsOfAddresses
        .map(groupOfAddresses => getUTXOsForAddresses(
          { addresses: groupOfAddresses }
        ));

      // Sum up all the utxo
      return Promise.all(promises)
        .then(groupsOfUTXOs => (
          groupsOfUTXOs.reduce((acc, groupOfUTXOs) => acc.concat(groupOfUTXOs), [])
        ));
    } catch (getUtxosError) {
      Logger.error('helpers:::batchUTXOsForAddresses error: ' +
        stringifyError(getUtxosError));
      throw new GetAllUTXOsForAddressesError();
    }
  };
}

/** List of Body hashes for a list of utxos by batching backend requests */
export function batchTxsBodiesForInputs(
  getTxsBodiesForUTXOs: TxBodiesFunc,
): TxBodiesFunc {
  return async function (body) {
    try {
      // split up all txs into chunks of equal size
      const groupsOfTxsHashes = _.chunk(body.txsHashes, CONFIG.app.txsBodiesRequestSize);

      // convert chunks into list of Promises that call the backend-service
      const promises = groupsOfTxsHashes
        .map(groupOfTxsHashes => getTxsBodiesForUTXOs({ txsHashes: groupOfTxsHashes }));

      // Sum up all the utxo
      return Promise.all(promises)
        .then(groupsOfTxBodies => {
          const bodies = groupsOfTxBodies
            .reduce((acc, groupOfTxBodies) => Object.assign(acc, groupOfTxBodies), {});
          if (body.txsHashes.length !== Object.keys(bodies).length) {
            throw new GetTxsBodiesForUTXOsError();
          }
          return bodies;
        });
    } catch (getTxBodiesError) {
      Logger.error('helpers::batchTxsBodiesForInputs error: ' +
        stringifyError(getTxBodiesError));
      throw new GetTxsBodiesForUTXOsError();
    }
  };
}
