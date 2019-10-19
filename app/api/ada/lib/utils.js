// @flow
import { groupBy, keyBy, mapValues } from 'lodash';
import BigNumber from 'bignumber.js';
import type {
  BaseSignRequest,
  RemoteUnspentOutput,
  UtxoAnnotatedTransaction,
  UserAnnotation,
} from '../adaTypes';
import {
  transactionTypes,
} from '../adaTypes';
import type {
  UtxoTransactionInputRow,
  UtxoTransactionOutputRow,
} from './storage/database/utxoTransactions/tables';
import type { TransactionExportRow } from '../../export';
import {
  DECIMAL_PLACES_IN_ADA,
  LOVELACES_PER_ADA,
  HARD_DERIVATION_START,
} from '../../../config/numbersConfig';
import { RustModule } from './cardanoCrypto/rustLoader';
import type {
  Addressing,
} from './storage/models/common/interfaces';
import {
  Bip44DerivationLevels,
} from './storage/database/bip44/api/utils';

export function getFromUserPerspective(data: {
  txInputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow>>,
  txOutputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>,
  allOwnedAddressIds: Set<number>,
}): UserAnnotation {
  // Note: logic taken from the mobile version of Yoroi
  // https://github.com/Emurgo/yoroi-mobile/blob/a3d72218b1e63f6362152aae2f03c8763c168795/src/crypto/transactionUtils.js#L73-L103

  const ownInputs = data.txInputs.filter(input => (
    data.allOwnedAddressIds.has(input.AddressId)
  ));

  const ownOutputs = data.txOutputs.filter(output => (
    data.allOwnedAddressIds.has(output.AddressId)
  ));

  const totalIn = sumInputsOutputs(data.txInputs);
  const totalOut = sumInputsOutputs(data.txOutputs);
  const ownIn = sumInputsOutputs(ownInputs);
  const ownOut = sumInputsOutputs(ownOutputs);

  const hasOnlyOwnInputs = ownInputs.length === data.txInputs.length;
  const hasOnlyOwnOutputs = ownOutputs.length === data.txOutputs.length;
  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs;
  const isMultiParty =
    ownInputs.length > 0 && ownInputs.length !== data.txInputs.length;

  const brutto = ownOut.minus(ownIn);
  const totalFee = totalOut.minus(totalIn); // should be negative

  if (isIntraWallet) {
    return {
      type: transactionTypes.SELF,
      amount: new BigNumber(0),
      fee: totalFee,
    };
  }
  if (isMultiParty) {
    return {
      type: transactionTypes.MULTI,
      amount: brutto,
      // note: fees not accurate but no logical way of finding which UTXO paid the fees
      fee: new BigNumber(0),
    };
  }
  if (hasOnlyOwnInputs) {
    return {
      type: transactionTypes.EXPEND,
      amount: brutto.minus(totalFee),
      fee: totalFee,
    };
  }

  return {
    type: transactionTypes.INCOME,
    amount: brutto,
    fee: new BigNumber(0),
  };
}

export function convertAdaTransactionsToExportRows(
  transactions: $ReadOnlyArray<$ReadOnly<UtxoAnnotatedTransaction>>
): Array<TransactionExportRow> {
  const result = [];
  for (const tx of transactions) {
    if (tx.block != null) {
      result.push({
        date: tx.block.BlockTime,
        type: tx.type === transactionTypes.INCOME ? 'in' : 'out',
        amount: formatBigNumberToFloatString(tx.amount.abs().dividedBy(LOVELACES_PER_ADA)),
        fee: formatBigNumberToFloatString(tx.fee.abs().dividedBy(LOVELACES_PER_ADA)),
      });
    }
  }
  return result;
}

export function sumInputsOutputs(
  ios: $ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow | UtxoTransactionOutputRow>>
): BigNumber {
  const amounts = ios.map(utxo => new BigNumber(utxo.Amount));
  const total = amounts.reduce(
    (acc, amount) => acc.plus(amount),
    new BigNumber(0)
  );
  return total;
}

/**
 * If specified number is integer - append `.0` to it.
 * Otherwise - just float representation.
 */
export function formatBigNumberToFloatString(x: BigNumber): string {
  return x.isInteger() ? x.toFixed(1) : x.toString();
}

export type UtxoLookupMap = { [string]: { [number]: RemoteUnspentOutput }};
export function utxosToLookupMap(
  utxos: Array<RemoteUnspentOutput>
): UtxoLookupMap {
  // first create 1-level map of (tx_hash -> [UTXO])
  const txHashMap = groupBy(utxos, utxo => utxo.tx_hash);

  // now create 2-level map of (tx_hash -> index -> UTXO)
  const lookupMap = mapValues(
    txHashMap,
    utxoList => keyBy(
      utxoList,
      utxo => utxo.tx_index
    )
  );
  return lookupMap;
}

export function derivePathAsString(
  accountIndex: number,
  chain: number,
  addressIndex: number
): string {
  if (accountIndex < HARD_DERIVATION_START) {
    throw new Error('derivePathAsString accountIndex < 0x80000000');
  }
  if (chain >= HARD_DERIVATION_START) {
    throw new Error('derivePathAsString chain >= 0x80000000');
  }
  if (addressIndex >= HARD_DERIVATION_START) {
    throw new Error('derivePathAsString addressIndex >= 0x80000000');
  }
  // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
  return `m/44'/1815'/${accountIndex - HARD_DERIVATION_START}'/${chain}/${addressIndex}`;
}

export function derivePathPrefix(accountIndex: number): string {
  if (accountIndex < HARD_DERIVATION_START) {
    throw new Error('derivePathAsString accountIndex < 0x80000000');
  }
  // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
  return `m/44'/1815'/${accountIndex}'`;
}

export function verifyAccountLevel(
  addressingInfo: Addressing,
): void {
  const { addressing } = addressingInfo;
  if (addressing.startLevel !== Bip44DerivationLevels.ACCOUNT.level) {
    throw new Error('_transformToTrezorInputs only accounts are supported');
  }
  const lastLevelSpecified = addressing.startLevel + addressing.path.length - 1;
  if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
    throw new Error('_transformToTrezorInputs incorrect addressing size');
  }
}

export function coinToBigNumber(coin: RustModule.WalletV2.Coin): BigNumber {
  const ada = new BigNumber(coin.ada());
  const lovelace = ada.times(LOVELACES_PER_ADA).plus(coin.lovelace());
  return lovelace;
}

export function signRequestFee(req: BaseSignRequest, shift: boolean): BigNumber {
  /**
   * Note: input-output != estimated fee
   *
   * Imagine you send a transaction with 1000 ADA input, 1 ADA output (no change)
   * Your fee is very small, but the difference between the input & output is high
   *
   * Therefore we instead display input - output as the fee in Yoroi
   * This is safer and gives a more consistent UI
   */

  const inputTotal = req.senderUtxos
    .map(utxo => new BigNumber(utxo.amount))
    .reduce((sum, val) => sum.plus(val), new BigNumber(0));

  const tx = req.unsignedTx.to_json();
  const outputTotal = tx.outputs
    .map(val => new BigNumber(val.value))
    .reduce((sum, val) => sum.plus(val), new BigNumber(0));

  let result = inputTotal.minus(outputTotal);
  if (shift) {
    result = result.shiftedBy(-DECIMAL_PLACES_IN_ADA);
  }
  return result;
}

export function signRequestTotalInput(req: BaseSignRequest, shift: boolean): BigNumber {
  const inputTotal = req.senderUtxos
    .map(utxo => new BigNumber(utxo.amount))
    .reduce((sum, val) => sum.plus(val), new BigNumber(0));

  const change = req.changeAddr
    .map(val => new BigNumber(val.value || new BigNumber(0)))
    .reduce((sum, val) => sum.plus(val), new BigNumber(0));

  let result = inputTotal.minus(change);
  if (shift) {
    result = result.shiftedBy(-DECIMAL_PLACES_IN_ADA);
  }
  return result;
}

export function signRequestReceivers(req: BaseSignRequest, includeChange: boolean): Array<string> {
  const tx = req.unsignedTx.to_json();
  let receivers = tx.outputs
    .map(val => val.address);

  if (!includeChange) {
    const changeAddrs = req.changeAddr.map(change => change.address);
    receivers = receivers.filter(addr => !changeAddrs.includes(addr));
  }
  return receivers;
}

/**
 * Signing a tx is a destructive operation in Rust
 * We create a copy of the tx so the user can retry if they get the password wrong
 */
export function copySignRequest(req: BaseSignRequest): BaseSignRequest {
  return {
    changeAddr: req.changeAddr,
    senderUtxos: req.senderUtxos,
    unsignedTx: req.unsignedTx.clone(),
  };
}

export function v2SkKeyToV3Key(
  v2Key: RustModule.WalletV2.PrivateKey,
): RustModule.WalletV3.PrivateKey {
  return RustModule.WalletV3.PrivateKey.from_extended_bytes(
     // need to slice out the chain code from the private key
    Buffer.from(v2Key.to_hex().slice(0, 128), 'hex')
  );
}
export function v2PkKeyToV3Key(
  v2Key: RustModule.WalletV2.PublicKey,
): RustModule.WalletV3.PublicKey {
  return RustModule.WalletV3.PublicKey.from_bytes(
    // need to slice out the chain code from the public key
    Buffer.from(v2Key.to_hex().slice(0, 64), 'hex')
  );
}
