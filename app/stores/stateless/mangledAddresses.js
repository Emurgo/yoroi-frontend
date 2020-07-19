// @flow

import BigNumber from 'bignumber.js';
import {
  asGetStakingKey
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  filterAddressesByStakingKey,
  unwrapStakingKey,
  addressToDisplayString,
} from '../../api/ada/lib/storage/bridge/utils';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { StandardAddress, } from '../../types/AddressFilterTypes';
import type {
  ConfigType,
} from '../../../config/config-types';

declare var CONFIG : ConfigType;

export async function filterMangledAddresses(request: {|
  publicDeriver: PublicDeriver<>,
  baseAddresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  invertFilter: boolean,
|}): Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> {
  const withStakingKey = asGetStakingKey(request.publicDeriver);
  if (withStakingKey == null) {
    if (request.invertFilter) return [];
    return request.baseAddresses.map(info => ({
      ...info,
      address: addressToDisplayString(
        info.address,
        request.publicDeriver.getParent().getNetworkInfo()
      ),
    }));
  }

  const stakingKeyResp = await withStakingKey.getStakingKey();
  const stakingKey = unwrapStakingKey(stakingKeyResp.addr.Hash);

  const filterResult = filterAddressesByStakingKey(
    stakingKey,
    request.baseAddresses,
    !request.invertFilter,
  );

  let result = filterResult;
  if (request.invertFilter) {
    const nonMangledSet = new Set(filterResult);
    result = request.baseAddresses.filter(info => !nonMangledSet.has(info));
  }

  return result.map(info => ({
    ...info,
    address: addressToDisplayString(info.address, request.publicDeriver.getParent().getNetworkInfo()),
  }));
}

export function getUnmangleAmounts(
  addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
): {|
  canUnmangle: Array<BigNumber>,
  cannotUnmangle: Array<BigNumber>,
|} {
  const canUnmangle = [];
  const cannotUnmangle = [];
  for (const addrInfo of addresses) {
    if (addrInfo.value != null) {
      const value = addrInfo.value;
      if (addrInfo.value.gt(CONFIG.genesis.linearFee.coefficient)) {
        canUnmangle.push(value);
      } else {
        cannotUnmangle.push(value);
      }
    }
  }
  const canUnmangleSum = canUnmangle.reduce(
    (sum, val) => sum.plus(val),
    new BigNumber(0)
  );
  const expectedFee = new BigNumber(canUnmangle.length + 1)
    .times(CONFIG.genesis.linearFee.coefficient)
    .plus(CONFIG.genesis.linearFee.constant);

  // if user would strictly lose ADA by making the transaction, don't prompt them to make it
  if (canUnmangleSum.lt(expectedFee)) {
    while (canUnmangle.length > 0) {
      cannotUnmangle.push(canUnmangle.pop());
    }
  }

  return {
    canUnmangle,
    cannotUnmangle
  };
}
