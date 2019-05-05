// @flow

import _ from 'lodash';
import {
  GetAllUTXOsForAddressesError,
} from '../../errors';
import {
  Logger,
  stringifyError
} from '../../../../utils/logging';

import type {
  AddressUtxoFunc
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
      Logger.error('yoroi-backend-api:::getAllUTXOsForAddresses error: ' +
        stringifyError(getUtxosError));
      throw new GetAllUTXOsForAddressesError();
    }
  };
}
