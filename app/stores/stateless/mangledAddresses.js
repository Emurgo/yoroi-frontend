// @flow

import BigNumber from 'bignumber.js';
import {
  isCardanoHaskell,
  getCardanoHaskellBaseConfig,
  isJormungandr,
  getJormungandrBaseConfig,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { genFilterSmallUtxo } from '../../api/ada/transactions/shelley/transactions';
import type { IGetAllUtxosResponse } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  asGetAllUtxos, asGetStakingKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { BASE_MANGLED, GROUP_MANGLED } from './addressStores';
import {
  unwrapStakingKey as CardanoUnwrapStakingKey,
} from '../../api/ada/lib/storage/bridge/utils';
import { asAddressedUtxo } from '../../api/ada/transactions/utils';
import {
  addrContainsAccountKey,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
import {
  groupAddrContainsAccountKey,
  unwrapStakingKey as JormungandrUnwrapStakingKey,
} from '../../api/jormungandr/lib/storage/bridge/utils';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';

export type MangledAmountsRequest = {|
  publicDeriver: PublicDeriver<>,
|};
export type MangledAmountsResponse = {|
  canUnmangle: MultiToken,
  cannotUnmangle: MultiToken,
|};
export type MangledAmountFunc = MangledAmountsRequest => Promise<MangledAmountsResponse>;

export async function getUnmangleAmounts(
  request: MangledAmountsRequest
): Promise<MangledAmountsResponse> {
  // note: keep track of arrays so we know the # of UTXO entries included
  const canUnmangle: Array<MultiToken> = [];
  const cannotUnmangle: Array<MultiToken> = [];

  const defaultToken = request.publicDeriver.getParent().getDefaultToken();

  const withUtxos = asGetAllUtxos(request.publicDeriver);
  if (withUtxos == null) {
    return {
      canUnmangle: new MultiToken([], defaultToken),
      cannotUnmangle: new MultiToken([], defaultToken),
    };
  }
  const utxos = await withUtxos.getAllUtxos();

  const withStakingKey = asGetStakingKey(request.publicDeriver);
  if (withStakingKey == null) {
    return {
      canUnmangle: new MultiToken([], defaultToken),
      cannotUnmangle: new MultiToken([], defaultToken),
    };
  }

  const stakingKeyResp = await withStakingKey.getStakingKey();

  const network = request.publicDeriver.getParent().getNetworkInfo();
  if (isJormungandr(network)) {
    const config = getJormungandrBaseConfig(
      network
    ).reduce((acc, next) => Object.assign(acc, next), {});

    const stakingKey = JormungandrUnwrapStakingKey(stakingKeyResp.addr.Hash);
    const stakingKeyString = Buffer.from(stakingKey.as_bytes()).toString('hex');

    for (const utxo of utxos) {
      // filter out addresses that contain your staking key
      // since if it contains your key, it's not mangled
      if (groupAddrContainsAccountKey(
        utxo.address,
        stakingKeyString,
        false
      )) {
        continue;
      }
      const tokens = new MultiToken(
        utxo.output.tokens.map(token => ({
          identifier: token.Token.Identifier,
          amount: new BigNumber(token.TokenList.Amount),
          networkId: token.Token.NetworkId,
        })),
        defaultToken
      );
      if (tokens.getDefault().gt(config.LinearFee.coefficient)) {
        canUnmangle.push(tokens);
      } else {
        cannotUnmangle.push(tokens);
      }
    }
    const canUnmangleSum = canUnmangle.reduce(
      (sum, val) => sum.plus(val.getDefault()),
      new BigNumber(0)
    );
    const expectedFee = new BigNumber(canUnmangle.length + 1)
      .times(config.LinearFee.coefficient)
      .plus(config.LinearFee.constant);

    // if user would strictly lose ADA by making the transaction, don't prompt them to make it
    if (canUnmangleSum.lt(expectedFee)) {
      while (canUnmangle.length > 0) {
        cannotUnmangle.push(canUnmangle.pop());
      }
    }
  }
  if (isCardanoHaskell(network)) {
    const config = getCardanoHaskellBaseConfig(
      network
    ).reduce((acc, next) => Object.assign(acc, next), {});

    const filter = genFilterSmallUtxo({
      protocolParams: {
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
        ),
      },
    });

    const stakingKey = CardanoUnwrapStakingKey(stakingKeyResp.addr.Hash);

    for (const utxo of utxos) {
      // filter out addresses that contain your staking key
      // since if it contains your key, it's not mangled
      if (addrContainsAccountKey(
        utxo.address,
        stakingKey,
        false,
      )) {
        continue;
      }

      const tokens = new MultiToken(
        utxo.output.tokens.map(token => ({
          identifier: token.Token.Identifier,
          amount: new BigNumber(token.TokenList.Amount),
          networkId: token.Token.NetworkId,
        })),
        defaultToken
      );

      // eslint-disable-next-line no-unused-vars
      const { addressing, ...rest } = asAddressedUtxo([utxo])[0];
      if (filter(rest)) {
        canUnmangle.push(tokens);
      } else {
        cannotUnmangle.push(tokens);
      }
    }
  }

  const flattenAmount = (list: Array<MultiToken>): MultiToken => list.reduce(
    (total, next) => total.joinAddMutable(next),
    new MultiToken([], defaultToken)
  );

  return {
    canUnmangle: flattenAmount(canUnmangle),
    cannotUnmangle: flattenAmount(cannotUnmangle),
  };
}

export function getMangledFilter(
  getAddresses: Class<any> => Set<string>,
  publicDeriver: PublicDeriver<>,
): (ElementOf<IGetAllUtxosResponse> => boolean) {
  const defaultTokenEntry = publicDeriver.getParent().getDefaultToken();

  if (isCardanoHaskell(publicDeriver.getParent().getNetworkInfo())) {
    const relevantAddresses = getAddresses(BASE_MANGLED.class);

    const config = getCardanoHaskellBaseConfig(
      publicDeriver.getParent().getNetworkInfo()
    ).reduce((acc, next) => Object.assign(acc, next), {});

    const filter = genFilterSmallUtxo({
      protocolParams: {
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
        ),
      },
    });

    return (utxo) => {
      if (!relevantAddresses.has(utxo.address)) {
        return false;
      }

      // eslint-disable-next-line no-unused-vars
      const { addressing, ...rest } = asAddressedUtxo([utxo])[0];
      return filter(rest);
    };
  }

  if (isJormungandr(publicDeriver.getParent().getNetworkInfo())) {
    const relevantAddresses = getAddresses(GROUP_MANGLED.class);

    const config = getJormungandrBaseConfig(
      publicDeriver.getParent().getNetworkInfo()
    ).reduce((acc, next) => Object.assign(acc, next), {});

    return (utxo) => {
      if (!relevantAddresses.has(utxo.address)) {
        return false;
      }
      const tokens = new MultiToken(
        utxo.output.tokens.map(token => ({
          identifier: token.Token.Identifier,
          amount: new BigNumber(token.TokenList.Amount),
          networkId: token.Token.NetworkId,
        })),
        defaultTokenEntry
      );
      const value = tokens.getDefault();
      return value.gt(config.LinearFee.coefficient);
    };
  }
  throw new Error(`${nameof(getMangledFilter)} no unmangle support for network ${publicDeriver.getParent().getNetworkInfo().NetworkId}`);
}
