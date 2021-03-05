// @flow
import { action, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import type {
  UserAnnotation,
} from '../api/ada/transactions/types';
import type {
  CardanoShelleyTxIO,
} from '../api/ada/lib/storage/database/transactionModels/multipart/tables';
import type {
  DbBlock,
  CertificatePart,
  NetworkRow,
} from '../api/ada/lib/storage/database/primitives/tables';
import WalletTransaction, { toAddr } from './WalletTransaction';
import type { WalletTransactionCtorData } from './WalletTransaction';
import { TransactionType } from '../api/ada/lib/storage/database/primitives/tables';
import { PRIMARY_ASSET_CONSTANTS } from '../api/ada/lib/storage/database/primitives/enums';
import {
  MultiToken,
} from '../api/common/lib/MultiToken';
import type {
  DefaultTokenEntry,
} from '../api/common/lib/MultiToken';

export default class CardanoShelleyTransaction extends WalletTransaction {

  @observable certificates: Array<CertificatePart>;
  @observable withdrawals: Array<{|
    address: string,
    value: MultiToken,
  |}>;
  @observable ttl: void | BigNumber;
  @observable metadata: null | string;

  constructor(data: {|
    ...WalletTransactionCtorData,
    certificates: Array<CertificatePart>,
    ttl: void | BigNumber,
    metadata: null | string,
    withdrawals: Array<{|
      address: string,
      value: MultiToken,
    |}>
  |}) {
    const { certificates, ttl, metadata, withdrawals, ...rest } = data;
    super(rest);
    this.certificates = certificates;
    this.ttl = ttl;
    this.metadata = metadata;
    this.withdrawals = withdrawals;
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
    defaultToken: DefaultTokenEntry
  |}): CardanoShelleyTransaction {
    const { addressLookupMap, defaultToken, tx } = request;
    if (tx.transaction.Type !== TransactionType.CardanoShelley) {
      throw new Error(`${nameof(CardanoShelleyTransaction)}::${this.constructor.fromAnnotatedTx} tx type incorrect`);
    }
    const { Extra } = tx.transaction;
    if (Extra == null) {
      throw new Error(`${nameof(CardanoShelleyTransaction)}::${this.constructor.fromAnnotatedTx} missing extra data`);
    }

    return new CardanoShelleyTransaction({
      txid: tx.transaction.Hash,
      block: tx.block,
      type: tx.type,
      // note: we use the explicitly fee in the transaction
      // and not outputs - inputs since Shelley has implicit inputs like refunds or withdrawals
      fee: new MultiToken(
        [{
          identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
          amount: new BigNumber(Extra.Fee),
          networkId: request.network.NetworkId,
        }],
        defaultToken,
      ),
      ttl: Extra.Ttl != null ? new BigNumber(Extra.Ttl) : undefined,
      metadata: Extra.Metadata,
      amount: tx.amount.joinAddCopy(tx.fee),
      date: tx.block != null
        ? tx.block.BlockTime
        : new Date(tx.transaction.LastUpdateTime),
      addresses: {
        from: toAddr({ rows: tx.utxoInputs, addressLookupMap, tokens: tx.tokens, defaultToken, }),
        to: toAddr({ rows: tx.utxoOutputs, addressLookupMap, tokens: tx.tokens, defaultToken, }),
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
    });
  }
}
