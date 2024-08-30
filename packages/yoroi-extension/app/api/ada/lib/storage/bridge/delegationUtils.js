// @flow

import BigNumber from 'bignumber.js';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import { asGetAllUtxos, } from '../models/PublicDeriver/traits';
import { PublicDeriver, } from '../models/PublicDeriver/index';
import { normalizeToAddress, unwrapStakingKey, } from './utils';
import type { IGetAllUtxosResponse, IGetStakingKey, } from '../models/PublicDeriver/interfaces';
import { MultiToken, } from '../../../../common/lib/MultiToken';
import { maybe, fail } from '../../../../../coreUtils';

export type GetDelegatedBalanceRequest = {|
  publicDeriver: PublicDeriver<> & IGetStakingKey,
  rewardBalance: MultiToken,
  stakingAddress: string,
  delegation: string | null,
  allRewards: string | null,
  stakeRegistered: ?boolean,
|};
export type GetDelegatedBalanceResponse = {|
  utxoPart: MultiToken,
  accountPart: MultiToken,
  delegation: string | null,
  allRewards: string | null,
  stakeRegistered: ?boolean,
|};
export type GetDelegatedBalanceFunc = (
  request: GetDelegatedBalanceRequest
) => Promise<GetDelegatedBalanceResponse>;
export type RewardHistoryRequest = string;
export type RewardHistoryResponse = Array<[
  number, // epoch
  MultiToken, // amount
  string, // poolHash
]>;
export type RewardHistoryFunc = (
  request: RewardHistoryRequest
) => Promise<RewardHistoryResponse>;

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
    allRewards: request.allRewards,
    stakeRegistered: request.stakeRegistered,
  };
}

export function addrContainsAccountKey(
  address: string,
  targetAccountKey: RustModule.WalletV4.Credential | string,
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
  stakingKey: RustModule.WalletV4.Credential,
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
    return publicDeriver.getParent().getDefaultMultiToken();
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
    publicDeriver.getParent().getDefaultMultiToken(),
  );

  return utxoSum;
}

export const DREP_ALWAYS_ABSTAIN = 'ALWAYS_ABSTAIN';
export const DREP_ALWAYS_NO_CONFIDENCE = 'ALWAYS_NO_CONFIDENCE';

// <TODO:WASM_MONAD>
function parseDrep(drepCredential: string): RustModule.WalletV4.DRep {
  try {
    const DRep = RustModule.WalletV4.DRep;
    if (drepCredential === DREP_ALWAYS_ABSTAIN) return DRep.new_always_abstain();
    if (drepCredential === DREP_ALWAYS_NO_CONFIDENCE) return DRep.new_always_no_confidence();
    const credential = RustModule.WalletV4.Credential.from_hex(drepCredential);
    return maybe(credential.to_keyhash(), k => DRep.new_key_hash(k))
      ?? maybe(credential.to_scripthash(), s => DRep.new_script_hash(s))
      ?? fail('weird credential cannot be converted into a drep: ' + credential.to_hex())
  } catch (e) {
    console.log('Fail to parse a drep credential: ' + drepCredential, e);
  }
}

// <TODO:WASM_MONAD>
export function createCertificate(
  stakingKeyHashHex: string,
  isRegistered: boolean,
  poolRequest: void | string,
  drepCredential: void | string,
): Array<RustModule.WalletV4.Certificate> {
  const credential = RustModule.WalletV4.Credential.from_keyhash(
    RustModule.WalletV4.Ed25519KeyHash.from_hex(stakingKeyHashHex)
  );
  if (poolRequest == null && drepCredential == null) {
    if (isRegistered) {
      return [
        RustModule.WalletV4.Certificate.new_stake_deregistration(
          RustModule.WalletV4.StakeDeregistration.new(credential)
        )
      ];
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
  if (poolRequest != null) {
    const poolKeyHash = RustModule.WalletV4.Ed25519KeyHash.from_hex(poolRequest);
    result.push(RustModule.WalletV4.Certificate.new_stake_delegation(
      RustModule.WalletV4.StakeDelegation.new(credential, poolKeyHash),
    ));
  }
  if (drepCredential != null) {
    result.push(RustModule.WalletV4.Certificate.new_vote_delegation(
      RustModule.WalletV4.VoteDelegation.new(credential, parseDrep(drepCredential)),
    ));
  }
  return result;
}

