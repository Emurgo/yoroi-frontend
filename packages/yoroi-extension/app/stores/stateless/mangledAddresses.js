// @flow

import BigNumber from 'bignumber.js';
import {
  isCardanoHaskell,
  getCardanoHaskellBaseConfig,
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
import { BASE_MANGLED } from './addressStores';
import {
  unwrapStakingKey as CardanoUnwrapStakingKey,
} from '../../api/ada/lib/storage/bridge/utils';
import { asAddressedUtxo } from '../../api/ada/transactions/utils';
import {
  addrContainsAccountKey,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
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

  throw new Error(`${nameof(getMangledFilter)} no unmangle support for network ${publicDeriver.getParent().getNetworkInfo().NetworkId}`);
}
