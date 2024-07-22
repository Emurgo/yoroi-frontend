// @flow

import BigNumber from 'bignumber.js';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import { normalizeToAddress, unwrapStakingKey, } from './utils';
import type { IGetAllUtxosResponse, } from '../models/PublicDeriver/interfaces';
import { MultiToken, } from '../../../../common/lib/MultiToken';
import type { WalletState } from '../../../../../../chrome/extension/background/types';

export type GetDelegatedBalanceRequest = {|
  wallet: WalletState,
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
    request.wallet,
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
  wallet: WalletState,
  _stakingAddress: string,
): Promise<MultiToken> {
  // TODO: need to also deal with pointer address summing
  // can get most recent pointer from getCurrentDelegation result

  const stakingKey = unwrapStakingKey(wallet.stakingAddress);
  const allUtxo = wallet.utxos;
  const allUtxosForKey = filterAddressesByStakingKey<ElementOf<IGetAllUtxosResponse>>(
    stakingKey,
    allUtxo,
    false,
  );
  const defaultToken = {
    defaultNetworkId: wallet.networkId,
    defaultIdentifier: wallet.defaultTokenId,
  };
  const defaultMultiToken = new MultiToken([], defaultToken);

  const utxoSum = allUtxosForKey.reduce(
    (sum, utxo) => sum.joinAddMutable(new MultiToken(
      utxo.output.tokens.map(token => ({
        identifier: token.Token.Identifier,
        amount: new BigNumber(token.TokenList.Amount),
        networkId: token.Token.NetworkId,
      })),
      defaultToken,
    )),
    defaultMultiToken,
  );

  return utxoSum;
}

export function createCertificate(
  stakingKey: RustModule.WalletV4.PublicKey,
  isRegistered: boolean,
  poolRequest: void | string,
): Array<RustModule.WalletV4.Certificate> {
  const credential = RustModule.WalletV4.Credential.from_keyhash(
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

