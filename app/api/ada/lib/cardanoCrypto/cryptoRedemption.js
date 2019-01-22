// @flow

import { Redemption } from 'rust-cardano-crypto';
import { SeedWithInvalidLengthError } from './cryptoErrors';
import type { ConfigType } from '../../../../../config/config-types';

declare var CONFIG : ConfigType;

const protocolMagic = CONFIG.network.protocolMagic;

export function getAddressFromRedemptionKey(
  redemptionKey: string,
): string {
  const address = Redemption.redemptionKeyToAddress(redemptionKey, protocolMagic);
  if (!address) {
    throw new SeedWithInvalidLengthError();
  }
  return address;
}
