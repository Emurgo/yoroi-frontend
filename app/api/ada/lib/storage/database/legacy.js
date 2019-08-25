// @flow

import type {
  AdaAddress,
} from '../../../adaTypes';
import type { lf$Database } from 'lovefield';

/**
 * This file contains methods used to extract information
 * from the legacy database format
 * They should NOT be used for any purpose other than
 * to migrate to a new format
 */

export const getLegacyAddressesList = (
  db: lf$Database
): Promise<Array<AdaAddress>> => {
  const addressesTable = db.getSchema().table('Addresses');
  return db.select()
    .from(addressesTable)
    .exec()
    .then(rows => rows.map(row => row.value));
};
