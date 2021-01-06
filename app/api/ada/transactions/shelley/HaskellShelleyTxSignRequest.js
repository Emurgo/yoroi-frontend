// @flow

import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import type { BaseSignRequest } from '../types';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { toHexOrBase58 } from '../../lib/storage/bridge/utils';
import {
  MultiToken,
} from '../../../common/lib/MultiToken';
import { PRIMARY_ASSET_CONSTANTS } from '../../lib/storage/database/primitives/enums';

/**
 * We take a copy of these parameters instead of re-evaluating them from the network
 * There are two reasons for this
 * 1) In Cardano, the protocol parameters used for transaction validation
 *    are the ones active the slot the transaction gets inserted it, and not the TTL slot
 *    Since a sign request isn't a slot yet, we need to keep track of which parameters we used
 * 2) Attempting to calculate the value of the network parameter at the time a transaction happens
 *    may require a database access
 *    and it doesn't make sense that this class be aware of the database or take any locks
*/
type NetworkSettingSnapshot = {|
  // there is no way given just a transaction body to 100% know which network it belongs to
  +NetworkId: number,
  +ChainNetworkId: number,
  +PoolDeposit: BigNumber,
  +KeyDeposit: BigNumber,
|};

export class HaskellShelleyTxSignRequest
implements ISignRequest<RustModule.WalletV4.TransactionBuilder> {

  signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder>;
  metadata: void | RustModule.WalletV4.TransactionMetadata;
  networkSettingSnapshot: NetworkSettingSnapshot;
  // TODO: this should be provided by WASM in some SignedTxBuilder interface of some kind
  neededStakingKeyHashes: {|
    neededHashes: Set<string>, // StakeCredential
    wits: Set<string>, // Vkeywitness
  |};

  constructor(
    signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder>,
    metadata: void | RustModule.WalletV4.TransactionMetadata,
    networkSettingSnapshot: NetworkSettingSnapshot,
    neededStakingKeyHashes: {|
      neededHashes: Set<string>, // StakeCredential
      wits: Set<string>, // Vkeywitness
    |},
  ) {
    this.signRequest = signRequest;
    this.metadata = metadata;
    this.networkSettingSnapshot = networkSettingSnapshot;
    this.neededStakingKeyHashes = neededStakingKeyHashes;
  }

  txId(): string {
    return Buffer.from(RustModule.WalletV4.hash_transaction(
      this.signRequest.unsignedTx.build()
    ).to_bytes()).toString('hex');
  }

  totalInput(): MultiToken {
    const values = new MultiToken(
      [],
      {
        defaultNetworkId: this.networkSettingSnapshot.NetworkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      }
    );

    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      amount: new BigNumber(
        this.signRequest.unsignedTx.get_implicit_input().checked_add(
          this.signRequest.unsignedTx.get_explicit_input()
        ).to_str(),
      ),
      networkId: this.networkSettingSnapshot.NetworkId,
    });
    this.signRequest.changeAddr.forEach(change => values.joinSubtractMutable(change.values));

    return values;
  }

  totalOutput(): MultiToken {
    const values = new MultiToken(
      [],
      {
        defaultNetworkId: this.networkSettingSnapshot.NetworkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      }
    );
    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      amount: new BigNumber(this.signRequest.unsignedTx.get_explicit_output().to_str()),
      networkId: this.networkSettingSnapshot.NetworkId,
    });

    return values;
  }

  fee(): MultiToken {
    const values = new MultiToken(
      [],
      {
        defaultNetworkId: this.networkSettingSnapshot.NetworkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      }
    );
    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      amount: new BigNumber(
        this.signRequest.unsignedTx.get_fee_if_set()?.to_str() || '0'
      ).plus(this.signRequest.unsignedTx.get_deposit().to_str()),
      networkId: this.networkSettingSnapshot.NetworkId,
    });

    return values;
  }

  withdrawals(): Array<{|
    +address: string,
    +amount: MultiToken,
  |}> {
    const withdrawals = this.signRequest.unsignedTx.build().withdrawals();
    if (withdrawals == null) return [];

    const withdrawalKeys = withdrawals.keys();
    const result = [];
    for (let i = 0; i < withdrawalKeys.len(); i++) {
      const rewardAddress = withdrawalKeys.get(i);
      const withdrawalAmount = withdrawals.get(rewardAddress)?.to_str();
      if (withdrawalAmount == null) continue;

      const amount = new MultiToken(
        [{
          identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
          amount: new BigNumber(withdrawalAmount),
          networkId: this.networkSettingSnapshot.NetworkId,
        }],
        {
          defaultNetworkId: this.networkSettingSnapshot.NetworkId,
          defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        }
      );
      result.push({
        address: Buffer.from(rewardAddress.to_address().to_bytes()).toString('hex'),
        amount,
      });
    }
    return result;
  }

  keyDeregistrations(): Array<{|
    +rewardAddress: string,
    +refund: MultiToken,
  |}> {
    const certs = this.signRequest.unsignedTx.build().certs();
    if (certs == null) return [];

    const result = [];
    for (let i = 0; i < certs.len(); i++) {
      const cert = certs.get(i).as_stake_deregistration();
      if (cert == null) continue;

      const address = RustModule.WalletV4.RewardAddress.new(
        this.networkSettingSnapshot.ChainNetworkId,
        cert.stake_credential(),
      );
      result.push({
        rewardAddress: Buffer.from(address.to_address().to_bytes()).toString('hex'),
        // recall: for now you get the full deposit back. May change in the future
        refund: new MultiToken(
          [{
            identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
            amount: this.networkSettingSnapshot.KeyDeposit,
            networkId: this.networkSettingSnapshot.NetworkId,
          }],
          {
            defaultNetworkId: this.networkSettingSnapshot.NetworkId,
            defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
          }
        ),
      });
    }
    return result;
  }

  receivers(includeChange: boolean): Array<string> {
    const outputs = this.signRequest.unsignedTx.build().outputs();

    const outputStrings = [];
    for (let i = 0; i < outputs.len(); i++) {
      outputStrings.push(toHexOrBase58(outputs.get(i).address()));
    }

    if (!includeChange) {
      const changeAddrs = this.signRequest.changeAddr.map(change => change.address);
      return outputStrings.filter(addr => !changeAddrs.includes(addr));
    }
    return outputStrings;
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(new Set(this.signRequest.senderUtxos.map(utxo => utxo.receiver)));
  }

  isEqual(tx: ?(mixed| RustModule.WalletV4.TransactionBuilder)): boolean {
    if (tx == null) return false;
    if (!(tx instanceof RustModule.WalletV4.TransactionBuilder)) {
      return false;
    }
    return shelleyTxEqual(
      this.signRequest.unsignedTx,
      tx
    );
  }

  self(): RustModule.WalletV4.TransactionBuilder {
    return this.signRequest.unsignedTx;
  }
}

export function shelleyTxEqual(
  req1: RustModule.WalletV4.TransactionBuilder,
  req2: RustModule.WalletV4.TransactionBuilder,
): boolean {
  return Buffer.from(req1.build().to_bytes()).toString('hex') === Buffer.from(req2.build().to_bytes()).toString('hex');
}
