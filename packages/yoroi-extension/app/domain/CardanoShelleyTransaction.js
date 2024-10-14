// @flow
import type { UserAnnotation } from '../api/ada/transactions/types';
import type { CardanoShelleyTxIO } from '../api/ada/lib/storage/database/transactionModels/multipart/tables';
import type {
  DbBlock,
  CertificatePart,
  NetworkRow,
} from '../api/ada/lib/storage/database/primitives/tables';
import type { WalletTransactionCtorData } from './WalletTransaction';
import type { DefaultTokenEntry } from '../api/common/lib/MultiToken';
import { action, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import WalletTransaction, { toAddr } from './WalletTransaction';
import { TransactionType } from '../api/ada/lib/storage/database/primitives/tables';
import { PRIMARY_ASSET_CONSTANTS } from '../api/ada/lib/storage/database/primitives/enums';
import { MultiToken } from '../api/common/lib/MultiToken';
import { parseMetadata } from '../api/ada/lib/storage/bridge/metadataUtils';
import { CatalystLabels } from '../api/ada/lib/cardanoCrypto/catalyst';
import { RustModule } from '../api/ada/lib/cardanoCrypto/rustLoader';
import { isEmptyArray } from '../coreUtils';

export type CardanoShelleyTransactionFeature =
  | 'CatalystVotingRegistration'
  | 'Withdrawal'
  | 'StakeDelegation'
  | 'StakeRegistration'
  | 'StakeDeregistration'
  | 'PoolRegistration'
  | 'PoolRetirement'
  | 'GenesisKeyDelegation'
  | 'MoveInstantaneousRewards';

export type CardanoShelleyTransactionCtorData = {|
  ...WalletTransactionCtorData,
  certificates: Array<CertificatePart>,
  ttl: void | BigNumber,
  metadata: null | string | Object,
  withdrawals: Array<{|
    address: string,
    value: MultiToken,
  |}>,
  isValid: boolean,
|};

export default class CardanoShelleyTransaction extends WalletTransaction {
  @observable certificates: Array<CertificatePart>;
  @observable withdrawals: Array<{|
    address: string,
    value: MultiToken,
  |}>;
  @observable ttl: void | BigNumber;
  @observable metadata: null | string | Object;
  @observable isValid: boolean;

  constructor(data: CardanoShelleyTransactionCtorData) {
    const { certificates, ttl, metadata, withdrawals, isValid, ...rest } = data;
    super(rest);
    this.certificates = certificates;
    this.ttl = ttl;
    this.metadata = metadata;
    this.withdrawals = withdrawals;
    this.isValid = isValid;
  }

  @action
  static fromData(data: CardanoShelleyTransactionCtorData): CardanoShelleyTransaction {
    return new CardanoShelleyTransaction(data);
  }

  @action
  static fromAnnotatedTx(request: {|
    tx: {|
      ...CardanoShelleyTxIO,
      ...WithNullableFields<DbBlock>,
      ...UserAnnotation,
    |},
    addressLookupMap: Map<number, string>,
    network: $ReadOnly<NetworkRow>,
    defaultToken: DefaultTokenEntry,
  |}): CardanoShelleyTransaction {
    const { addressLookupMap, defaultToken, tx } = request;
    if (tx.transaction.Type !== TransactionType.CardanoShelley) {
      throw new Error(
        `${nameof(CardanoShelleyTransaction)}::${
          this.constructor.fromAnnotatedTx
        } tx type incorrect`
      );
    }
    const { Extra } = tx.transaction;
    if (Extra == null) {
      throw new Error(
        `${nameof(CardanoShelleyTransaction)}::${
          this.constructor.fromAnnotatedTx
        } missing extra data`
      );
    }
    return new CardanoShelleyTransaction({
      txid: tx.transaction.Hash,
      ordinal: tx.transaction.Ordinal,
      block: tx.block,
      type: tx.type,
      // note: we use the explicitly fee in the transaction
      // and not outputs - inputs since Shelley has implicit inputs like refunds or withdrawals
      fee: new MultiToken(
        [
          {
            identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
            amount: new BigNumber(Extra.Fee),
            networkId: request.network.NetworkId,
          },
        ],
        defaultToken
      ),
      ttl: Extra.Ttl != null ? new BigNumber(Extra.Ttl) : undefined,
      metadata: Extra.Metadata,
      amount: tx.amount.joinAddCopy(tx.fee),
      date: tx.block != null ? tx.block.BlockTime : new Date(tx.transaction.LastUpdateTime),
      addresses: {
        from: toAddr({ rows: tx.utxoInputs, addressLookupMap, tokens: tx.tokens, defaultToken }),
        to: toAddr({
          rows: tx.utxoOutputs,
          addressLookupMap,
          tokens: tx.tokens,
          defaultToken,
        }).map(a => ({ ...a, isForeign: false })),
      },
      withdrawals: toAddr({
        rows: tx.accountingInputs,
        addressLookupMap,
        tokens: tx.tokens,
        defaultToken,
      }),
      certificates: tx.certificates,
      state: tx.transaction.Status,
      errorMsg: tx.transaction.ErrorMessage,
      isValid: !!Extra.IsValid,
    });
  }

  isCatalystVotingRegistration(): boolean {
    if (this.metadata == null || isEmptyArray(this.metadata)) {
      return false;
    }
    const metadataString = parseMetadata(this.metadata);
    let metadata;
    try {
      metadata = JSON.parse(metadataString);
    } catch {
      return false;
    }
    if (metadata[String(CatalystLabels.DATA)]) {
      return true;
    }
    return false;
  }

  getFeatures(): Array<CardanoShelleyTransactionFeature> {
    const features = [];
    if (this.withdrawals.length) {
      features.push('Withdrawal');
    }
    if (this.isCatalystVotingRegistration()) {
      features.push('CatalystVotingRegistration');
    }
    for (const cert of this.certificates) {
      if (cert.certificate.Kind === RustModule.WalletV4.CertificateKind.StakeDelegation) {
        features.push('StakeDelegation');
      }
      if (cert.certificate.Kind === RustModule.WalletV4.CertificateKind.StakeRegistration) {
        features.push('StakeRegistration');
      }
      if (cert.certificate.Kind === RustModule.WalletV4.CertificateKind.StakeDeregistration) {
        features.push('StakeDeregistration');
      }
      if (cert.certificate.Kind === RustModule.WalletV4.CertificateKind.PoolRegistration) {
        features.push('PoolRegistration');
      }
      if (cert.certificate.Kind === RustModule.WalletV4.CertificateKind.PoolRetirement) {
        features.push('PoolRetirement');
      }
      if (cert.certificate.Kind === RustModule.WalletV4.CertificateKind.GenesisKeyDelegation) {
        features.push('GenesisKeyDelegation');
      }
      if (
        cert.certificate.Kind === RustModule.WalletV4.CertificateKind.MoveInstantaneousRewardsCert
      ) {
        features.push('MoveInstantaneousRewards');
      }
    }

    return features;
  }
}

// fix Date, BigNumber and MultiToken values after deserialization
// note: although the input is of `CardanoShelleyTransactionCtorData` type, its value is actually
// serialized-and-deserialized
export function deserializeTransactionCtorData(
  serializedData: CardanoShelleyTransactionCtorData
): CardanoShelleyTransactionCtorData {
  const result: CardanoShelleyTransactionCtorData = {
    txid: serializedData.txid,
    block: undefined,
    type: serializedData.type,
    amount: MultiToken.from((serializedData.amount: any)),
    fee: MultiToken.from((serializedData.fee: any)),
    date: new Date(serializedData.date),
    addresses: {
      from: serializedData.addresses.from.map(({ address, value }) => ({
        address,
        value: MultiToken.from((value: any)),
      })),
      to: serializedData.addresses.to.map(({ address, value, isForeign }) => ({
        address,
        isForeign,
        value: MultiToken.from((value: any)),
      })),
    },
    state: serializedData.state,
    errorMsg: serializedData.errorMsg,
    certificates: serializedData.certificates,
    ttl: serializedData.ttl && new BigNumber(serializedData.ttl),
    metadata: serializedData.metadata,
    withdrawals: serializedData.withdrawals.map(({ address, value }) => ({
      address,
      value: MultiToken.from((value: any))
    })),
    isValid: serializedData.isValid,
  };

  if (Object.prototype.hasOwnProperty.call(serializedData, 'ordinal')) {
    result.ordinal = serializedData.ordinal;
  }
  if (typeof serializedData.block === 'object' && serializedData.block !== null) {
    result.block = { ...serializedData.block, BlockTime: new Date(serializedData.block.BlockTime) };
  }

  return result;
}
