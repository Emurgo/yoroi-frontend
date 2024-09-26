// @flow

import type { CardanoAddressedUtxo } from '../types';
import type { TxDataOutput } from '../../../common/types';
import type { Address, Addressing, Value, } from '../../lib/storage/models/PublicDeriver/interfaces';
import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { toHexOrBase58 } from '../../lib/storage/bridge/utils';
import { MultiToken, } from '../../../common/lib/MultiToken';
import { PRIMARY_ASSET_CONSTANTS } from '../../lib/storage/database/primitives/enums';
import { multiTokenFromCardanoValue, multiTokenFromRemote } from '../utils';
import typeof { CertificateKind } from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import { forceNonNull, iterateLenGet, iterateLenGetMap } from '../../../../coreUtils';

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

export type LedgerNanoCatalystRegistrationTxSignData = {|
  votingPublicKey: string,
  stakingKeyPath: Array<number>,
  stakingKey: string,
  paymentAddress: string,
  paymentKeyPath: Array<number>,
  nonce: number,
|};

export type TrezorTCatalystRegistrationTxSignData =
  LedgerNanoCatalystRegistrationTxSignData;

export class HaskellShelleyTxSignRequest
implements ISignRequest<RustModule.WalletV4.TransactionBuilder> {

  senderUtxos: Array<CardanoAddressedUtxo>;
  unsignedTx: RustModule.WalletV4.TransactionBuilder;
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>;
  metadata: void | RustModule.WalletV4.AuxiliaryData;
  networkSettingSnapshot: NetworkSettingSnapshot;
  // TODO: this should be provided by WASM in some SignedTxBuilder interface of some kind
  neededStakingKeyHashes: {|
    neededHashes: Set<string>, // StakeCredential
    wits: Set<string>, // Vkeywitness
  |};
  trezorTCatalystRegistrationTxSignData:
    void | TrezorTCatalystRegistrationTxSignData;
  ledgerNanoCatalystRegistrationTxSignData:
    void | LedgerNanoCatalystRegistrationTxSignData;

  constructor(data: {|
    senderUtxos: Array<CardanoAddressedUtxo>,
    unsignedTx: RustModule.WalletV4.TransactionBuilder,
    changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
    metadata: void | RustModule.WalletV4.AuxiliaryData,
    networkSettingSnapshot: NetworkSettingSnapshot,
    neededStakingKeyHashes: {|
      neededHashes: Set<string>, // StakeCredential
      wits: Set<string>, // Vkeywitness
    |},
    trezorTCatalystRegistrationTxSignData?:
      void | TrezorTCatalystRegistrationTxSignData;
    ledgerNanoCatalystRegistrationTxSignData?:
      void | LedgerNanoCatalystRegistrationTxSignData;
  |}) {
    this.senderUtxos = data.senderUtxos;
    this.unsignedTx = data.unsignedTx;
    this.changeAddr = data.changeAddr;
    this.metadata = data.metadata;
    this.networkSettingSnapshot = data.networkSettingSnapshot;
    this.neededStakingKeyHashes = data.neededStakingKeyHashes;
    this.trezorTCatalystRegistrationTxSignData =
      data.trezorTCatalystRegistrationTxSignData;
    this.ledgerNanoCatalystRegistrationTxSignData =
      data.ledgerNanoCatalystRegistrationTxSignData;
  }

  txId(): string {
    return RustModule.WalletV4.hash_transaction(this.unsignedTx.build()).to_hex();
  }

  size(): {| full: number, outputs: number[] |} {
    return {
      full: this.unsignedTx.full_size(),
      outputs: [...this.unsignedTx.output_sizes()],
    };
  }

  inputs(): Array<{|
    address: string,
    value: MultiToken,
  |}> {
    const body = this.unsignedTx.build();
    return iterateLenGet(body.inputs()).map(input => {
      const key = {
        hash: input.transaction_id().to_hex(),
        index: input.index(),
      };
      const utxoEntry = this.senderUtxos.find(
        utxo => utxo.tx_hash === key.hash && utxo.tx_index === key.index
      );
      if (utxoEntry == null) {
        throw new Error(`${nameof(this.inputs)} missing ${nameof(this.senderUtxos)} input for ${JSON.stringify(key)}`);
      }
      return {
        value: multiTokenFromRemote(
          utxoEntry,
          this.networkSettingSnapshot.NetworkId,
        ),
        address: utxoEntry.receiver,
      };
    }).toArray();
  }

  totalInput(): MultiToken {
    const values = multiTokenFromCardanoValue(
      this.unsignedTx.get_implicit_input().checked_add(
        this.unsignedTx.get_explicit_input()
      ),
      {
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        defaultNetworkId: this.networkSettingSnapshot.NetworkId,
      },
    );
    this.changeAddr.forEach(change => values.joinSubtractMutable(change.values));

    return values;
  }

  outputs(): Array<TxDataOutput> {
    const body = this.unsignedTx.build();
    return iterateLenGet(body.outputs()).map(output => ({
      value: multiTokenFromCardanoValue(
        output.amount(),
        {
          defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
          defaultNetworkId: this.networkSettingSnapshot.NetworkId,
        },
      ),
      isForeign: false,
      address: output.address().to_hex(),
    })).toArray();
  }

  totalOutput(): MultiToken {
    return multiTokenFromCardanoValue(
      this.unsignedTx.get_explicit_output(),
      {
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        defaultNetworkId: this.networkSettingSnapshot.NetworkId,
      },
    );
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
        this.unsignedTx.get_fee_if_set()?.to_str() || '0'
      ).plus(this.unsignedTx.get_deposit().to_str()),
      networkId: this.networkSettingSnapshot.NetworkId,
    });

    return values;
  }

  withdrawals(): Array<{|
    +address: string,
    +amount: MultiToken,
  |}> {
    const withdrawals = this.unsignedTx.build().withdrawals();
    return iterateLenGetMap(withdrawals).map(([rewardAddress, withdrawalAmount]) => ({
      address: rewardAddress.to_address().to_hex(),
      amount: new MultiToken(
        [{
          identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
          amount: new BigNumber(forceNonNull(withdrawalAmount).to_str()),
          networkId: this.networkSettingSnapshot.NetworkId,
        }],
        {
          defaultNetworkId: this.networkSettingSnapshot.NetworkId,
          defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        }
      ),
    })).toArray();
  }

  keyDeregistrations(): Array<{|
    +rewardAddress: string,
    +refund: MultiToken,
  |}> {
    const certs = this.unsignedTx.build().certs();
    return iterateLenGet(certs)
      .map(c => c.as_stake_deregistration())
      .nonNull()
      .map(cert => {
        const rewardAddress = RustModule.WalletV4.RewardAddress.new(
          this.networkSettingSnapshot.ChainNetworkId,
          cert.stake_credential(),
        ).to_address().to_hex();
        const refund = new MultiToken(
          [{
            identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
            amount: this.networkSettingSnapshot.KeyDeposit,
            networkId: this.networkSettingSnapshot.NetworkId,
          }],
          {
            defaultNetworkId: this.networkSettingSnapshot.NetworkId,
            defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
          }
        );
        return ({ rewardAddress, refund });
      })
      .toArray();
  }

  certificates(): Array<{| kind: $Values<CertificateKind>, payloadHex: string |}> {
    const res = [];
    for (const cert of iterateLenGet(this.unsignedTx.build().certs())) {
      res.push({
        kind: cert.kind(),
        payloadHex: cert.to_hex(),
      });
    }
    return res;
  }

  receivers(includeChange: boolean): Array<string> {
    const outputStrings = [];
    for (const output of iterateLenGet(this.unsignedTx.build().outputs())) {
      outputStrings.push(toHexOrBase58(output.address()));
    }

    if (!includeChange) {
      const changeAddrs = this.changeAddr.map(change => change.address);
      return outputStrings.filter(addr => !changeAddrs.includes(addr));
    }
    return outputStrings;
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(new Set(this.senderUtxos.map(utxo => utxo.receiver)));
  }

  isEqual(tx: ?(mixed| RustModule.WalletV4.TransactionBuilder)): boolean {
    if (tx == null) return false;
    if (!(tx instanceof RustModule.WalletV4.TransactionBuilder)) {
      return false;
    }
    return shelleyTxEqual(
      this.unsignedTx,
      tx
    );
  }

  self(): RustModule.WalletV4.TransactionBuilder {
    return this.unsignedTx;
  }
}

export function shelleyTxEqual(
  req1: RustModule.WalletV4.TransactionBuilder,
  req2: RustModule.WalletV4.TransactionBuilder,
): boolean {
  return req1.build().to_hex() === req2.build().to_hex();
}
