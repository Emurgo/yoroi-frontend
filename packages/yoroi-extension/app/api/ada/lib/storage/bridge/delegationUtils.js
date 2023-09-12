// @flow

import BigNumber from 'bignumber.js';
import {
  getCertificates,
} from '../models/utils';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import {
  asGetAllUtxos,
} from '../models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../models/PublicDeriver/index';
import {
  normalizeToAddress,
  unwrapStakingKey,
} from './utils';
import { TxStatusCodes, } from '../database/primitives/enums';
import type { CertificateInsert } from '../database/primitives/tables';
import type {
  GetDelegatedBalanceRequest,
  GetDelegatedBalanceResponse,
  GetCurrentDelegationRequest,
  GetCurrentDelegationResponse,
  PoolTuples,
} from '../../../../common/lib/storage/bridge/delegationUtils';
import typeof { CertificateKind } from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import type {
  IGetStakingKey,
  IGetAllUtxosResponse,
} from '../models/PublicDeriver/interfaces';
import type {
  CertificateForKey,
} from '../database/primitives/api/read';
import {
  MultiToken,
} from '../../../../common/lib/MultiToken';

export async function getDelegatedBalance(
  request: GetDelegatedBalanceRequest,
): Promise<GetDelegatedBalanceResponse> {
  const utxoPart = await getUtxoDelegatedBalance(
    request.publicDeriver,
    request.stakingAddress,
  );

  return {
    utxoPart,
    accountPart: request.rewardBalance,
    delegation: request.delegation,
  };
}

export function addrContainsAccountKey(
  address: string,
  targetAccountKey: RustModule.WalletV4.StakeCredential | string,
  acceptTypeMismatch: boolean,
): boolean {
  const wasmAddr = normalizeToAddress(address);
  if (wasmAddr == null) throw new Error(`${nameof(addrContainsAccountKey)} invalid address ${address}`);

  const accountKeyString = typeof targetAccountKey === 'string' ? targetAccountKey : Buffer.from(targetAccountKey.to_bytes()).toString('hex');

  const asBase = RustModule.WalletV4.BaseAddress.from_address(wasmAddr);

  if (asBase != null) {
    const isAccountKey = Buffer.from(asBase.stake_cred().to_bytes()).toString('hex') === accountKeyString;
    // clean: de-allocate the pointer
    asBase.free();
    if (isAccountKey) return true;

  }

  const asPointer = RustModule.WalletV4.PointerAddress.from_address(wasmAddr);
  if (asPointer != null) {
    // clean: de-allocate the pointer
    asPointer.free()
  }

  // clean: de-allocate the pointer
  wasmAddr.free();

  return acceptTypeMismatch;
}

export function filterAddressesByStakingKey<T: { +address: string, ... }>(
  stakingKey: RustModule.WalletV4.StakeCredential,
  utxos: $ReadOnlyArray<$ReadOnly<T>>,
  acceptTypeMismatch: boolean,
): $ReadOnlyArray<$ReadOnly<T>> {
  const result = [];
  for (const utxo of utxos) {
    if (addrContainsAccountKey(utxo.address, stakingKey, acceptTypeMismatch)) {
      result.push(utxo);
    }
  }
  return result;
}

export async function getUtxoDelegatedBalance(
  publicDeriver: PublicDeriver<>,
  stakingAddress: string,
): Promise<MultiToken> {
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    return new MultiToken([], publicDeriver.getParent().getDefaultToken());
  }
  const basePubDeriver = withUtxos;

  // TODO: need to also deal with pointer address summing
  // can get most recent pointer from getCurrentDelegation result

  const stakingKey = unwrapStakingKey(stakingAddress);
  const allUtxo = await basePubDeriver.getAllUtxos();
  const allUtxosForKey = filterAddressesByStakingKey<ElementOf<IGetAllUtxosResponse>>(
    stakingKey,
    allUtxo,
    false,
  );
  const utxoSum = allUtxosForKey.reduce(
    (sum, utxo) => sum.joinAddMutable(new MultiToken(
      utxo.output.tokens.map(token => ({
        identifier: token.Token.Identifier,
        amount: new BigNumber(token.TokenList.Amount),
        networkId: token.Token.NetworkId,
      })),
      publicDeriver.getParent().getDefaultToken()
    )),
    new MultiToken([], publicDeriver.getParent().getDefaultToken())
  );

  return utxoSum;
}

export async function getCertificateHistory(request: {|
  publicDeriver: PublicDeriver<> & IGetStakingKey,
  stakingKeyAddressId: number,
  kindFilter: Array<$Values<CertificateKind>>,
|}): Promise<Array<CertificateForKey>> {
  // recall: results are sorted by block & tx & cert index order (DESC)
  const allDelegations = await getCertificates(
    request.publicDeriver.getDb(),
    [request.stakingKeyAddressId]
  );

  const filteredList = [];
  for (const delegation of allDelegations) {
    const block = delegation.block;
    if (block == null) {
      continue;
    }

    // only look at successful txs
    if (delegation.transaction.Status !== TxStatusCodes.IN_BLOCK) {
      continue;
    }
    const kind = delegation.certificate.Kind;
    if (!request.kindFilter.includes(kind)) {
      continue;
    }

    filteredList.push(delegation);
  }
  return filteredList;
}


export async function getCurrentDelegation(
  request: GetCurrentDelegationRequest,
): Promise<GetCurrentDelegationResponse> {
  const delegations = await getCertificateHistory({
    publicDeriver: request.publicDeriver,
    stakingKeyAddressId: request.stakingKeyAddressId,
    kindFilter: [
      // note: we don't care about stake registration
      // since it  doesn't actually change what pool you're delegating to
      // stake deregistration, on the other hand, undelegates you from the pool
      RustModule.WalletV4.CertificateKind.StakeDeregistration,
      RustModule.WalletV4.CertificateKind.StakeDelegation
    ]
  });

  const result = {
    currEpoch: undefined,
    prevEpoch: undefined,
    prevPrevEpoch: undefined,
    prevPrevPrevEpoch: undefined,
    fullHistory: delegations,
  };
  const seenPools = new Set<string>();
  for (const delegation of delegations) {
    const block = delegation.block;
    if (block == null) continue; // should never happen
    const relativeSlot = request.toRelativeSlotNumber(block.SlotNum);

    // recall: undelegation is an empty array
    // so this code handles undelegation as well
    const pools = certificateToPoolList(
      delegation.certificate.Payload,
      delegation.certificate.Kind
    );
    pools.forEach(pool => seenPools.add(pool[0]));
    // calculate which certificate was active at the end of each epoch
    if (result.currEpoch == null && relativeSlot.epoch <= request.currentEpoch) {
      result.currEpoch = {
        ...delegation,
        pools,
      };
    }
    if (result.prevEpoch == null && relativeSlot.epoch <= request.currentEpoch - 1) {
      result.prevEpoch = {
        ...delegation,
        pools,
      };
    }
    if (result.prevPrevEpoch == null && relativeSlot.epoch <= request.currentEpoch - 2) {
      result.prevPrevEpoch = {
        ...delegation,
        pools,
      };
    }
    if (result.prevPrevPrevEpoch == null && relativeSlot.epoch <= request.currentEpoch - 3) {
      result.prevPrevPrevEpoch = {
        ...delegation,
        pools,
      };
      break;
    }
  }
  return {
    ...result,
    allPoolIds: Array.from(seenPools)
  };
}

export type GetRegistrationHistoryRequest = {|
  publicDeriver: PublicDeriver<> & IGetStakingKey,
  stakingKeyAddressId: number,
|};
export type GetRegistrationHistoryResponse = {|
  current: boolean,
  fullHistory: Array<CertificateForKey>,
|};
export type GetRegistrationHistoryFunc = (
  request: GetRegistrationHistoryRequest
) => Promise<GetRegistrationHistoryResponse>;

export async function getRegistrationHistory(
  request: GetRegistrationHistoryRequest,
): Promise<GetRegistrationHistoryResponse> {
  const delegations = await getCertificateHistory({
    publicDeriver: request.publicDeriver,
    stakingKeyAddressId: request.stakingKeyAddressId,
    kindFilter: [
      RustModule.WalletV4.CertificateKind.StakeDeregistration,
      RustModule.WalletV4.CertificateKind.StakeRegistration
    ]
  });

  const result = {
    current: (
      delegations.length === 0
        ? false
        : delegations[0].certificate.Kind === RustModule.WalletV4.CertificateKind.StakeRegistration
    ),
    fullHistory: delegations,
  };

  return result;
}

export function certificateToPoolList(
  certificateHex: string,
  kind: $PropertyType<CertificateInsert, 'Kind'>,
): Array<PoolTuples> {
  return RustModule.WasmScope(Scope => {
    if (kind === Scope.WalletV4.CertificateKind.StakeDeregistration) return []
    if (kind === Scope.WalletV4.CertificateKind.StakeDelegation) {
      const cert = Scope.WalletV4.StakeDelegation.from_bytes(Buffer.from(certificateHex, 'hex'));
      return [
        [Buffer.from(cert.pool_keyhash().to_bytes()).toString('hex'), 1]
      ];
    }

    throw new Error(`${nameof(certificateToPoolList)} unexpected certificate kind ${kind}`);
  });
}

export function createCertificate(
  stakingKey: RustModule.WalletV4.PublicKey,
  isRegistered: boolean,
  poolRequest: void | string,
): Array<RustModule.WalletV4.Certificate> {
  const credential = RustModule.WalletV4.StakeCredential.from_keyhash(
    stakingKey.hash()
  );

  if (poolRequest == null) {
    if (isRegistered) {
      return [RustModule.WalletV4.Certificate.new_stake_deregistration(
        RustModule.WalletV4.StakeDeregistration.new(credential)
      )];
    }
    return []; // no need to undelegate if no staking key registered
  }

  const result = [];
  if (!isRegistered) {
    // if unregistered, need to register first
    result.push(RustModule.WalletV4.Certificate.new_stake_registration(
      RustModule.WalletV4.StakeRegistration.new(credential)
    ));
  }
  result.push(RustModule.WalletV4.Certificate.new_stake_delegation(
    RustModule.WalletV4.StakeDelegation.new(
      credential,
      RustModule.WalletV4.Ed25519KeyHash.from_bytes(Buffer.from(poolRequest, 'hex'))
    )
  ));
  return result;
}

