// @flow

import type {
  Addressing,
} from '../../../../ada/lib/storage/models/PublicDeriver/interfaces';
import type { IKeyDerivation } from './types';
import { deriveKey } from './keyRepository';

export function deriveByAddressing<T: IKeyDerivation>(request: {|
  addressing: $PropertyType<Addressing, 'addressing'>,
  startingFrom: {|
    key: T,
    level: number,
  |},
|}): T {
  if (request.startingFrom.level + 1 < request.addressing.startLevel) {
    throw new Error(`${nameof(deriveByAddressing)} keyLevel < startLevel`);
  }
  let derivedKey = request.startingFrom.key;
  for (
    let i = request.startingFrom.level - request.addressing.startLevel + 1;
    i < request.addressing.path.length;
    i++
  ) {
    derivedKey = deriveKey(derivedKey, request.addressing.path[i]);
  }
  return derivedKey;
}
