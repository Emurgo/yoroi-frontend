// @flow
import { groupBy, keyBy, mapValues } from 'lodash';
import BigNumber from 'bignumber.js';
import type {
  UtxoAnnotatedTransaction,
  UserAnnotation,
  BaseSignRequest,
} from './types';
import type {
  RemoteUnspentOutput,
} from '../lib/state-fetch/types';
import {
  transactionTypes,
} from './types';
import type {
  UtxoTransactionInputRow,
  UtxoTransactionOutputRow,
} from '../lib/storage/database/transactionModels/utxo/tables';
import type { TransactionExportRow } from '../../export';
import {
  LOVELACES_PER_ADA,
  HARD_DERIVATION_START,
} from '../../../config/numbersConfig';
import { RustModule } from '../lib/cardanoCrypto/rustLoader';
import type {
  Addressing,
} from '../lib/storage/models/PublicDeriver/interfaces';
import {
  Bip44DerivationLevels,
} from '../lib/storage/database/walletTypes/bip44/api/utils';
import {
  signRequestReceivers,
  signRequestFee,
  signRequestTotalInput,
  byronTxEqual,
} from './byron/utils';
import {
  getShelleyTxFee,
  getTxInputTotal,
  getShelleyTxReceivers,
  shelleyTxEqual,
} from './shelley/utils';

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

export function v3SecretToV2(
  v3Key: RustModule.WalletV3.Bip32PrivateKey,
): RustModule.WalletV2.PrivateKey {
  return RustModule.WalletV2.PrivateKey.from_hex(
    Buffer.from(v3Key.as_bytes()).toString('hex')
  );
}
export function v3PublicToV2(
  v3Key: RustModule.WalletV3.Bip32PublicKey,
): RustModule.WalletV2.PublicKey {
  return RustModule.WalletV2.PublicKey.from_hex(
    Buffer.from(v3Key.as_bytes()).toString('hex')
  );
}

/**
 * Will return undefined for Daedalus addresses (can't be represented by v3 WASM)
 */
export function v2SecretToV3(
  v2Key: RustModule.WalletV2.PrivateKey,
): RustModule.WalletV3.Bip32PrivateKey | void {
  try {
    return RustModule.WalletV3.Bip32PrivateKey.from_bytes(
      Buffer.from(v2Key.to_hex(), 'hex')
    );
  } catch (_e) {
    return undefined;
  }
}
/**
 * Will return undefined for Daedalus addresses (can't be represented by v3 WASM)
 */
export function v2PublicToV3(
  v2Key: RustModule.WalletV2.PublicKey,
): RustModule.WalletV3.Bip32PublicKey | void {
  try {
    return RustModule.WalletV3.Bip32PublicKey.from_bytes(
      Buffer.from(v2Key.to_hex(), 'hex')
    );
  } catch (_e) {
    return undefined;
  }
}


export function IGetFee(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
  shift: boolean
): BigNumber {
  /**
   * Note: input-output != estimated fee
   *
   * Imagine you send a transaction with 1000 ADA input, 1 ADA output (no change)
   * Your fee is very small, but the difference between the input & output is high
   *
   * Therefore we instead display input - output as the fee in Yoroi
   * This is safer and gives a more consistent UI
   */
  const unsignedTx = signRequest.unsignedTx;
  if (unsignedTx instanceof RustModule.WalletV2.Transaction) {
    return signRequestFee(
      {
        ...signRequest,
        unsignedTx,
      },
      shift,
    );
  }
  if (unsignedTx instanceof RustModule.WalletV3.InputOutput) {
    return getShelleyTxFee(unsignedTx, shift);
  }
  throw new Error('IGetFee Unimplemented');
}

export function ITotalInput(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
  shift: boolean
): BigNumber {
  const unsignedTx = signRequest.unsignedTx;
  return signRequestTotalInput(
    {
      ...signRequest,
      unsignedTx,
    },
    shift,
  );
}

export function IReceivers(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
  includeChange: boolean
): Array<string> {
  const unsignedTx = signRequest.unsignedTx;
  if (unsignedTx instanceof RustModule.WalletV2.Transaction) {
    return signRequestReceivers(
      {
        ...signRequest,
        unsignedTx,
      },
      includeChange,
    );
  }
  if (unsignedTx instanceof RustModule.WalletV3.InputOutput) {
    return getShelleyTxReceivers(
      {
        ...signRequest,
        unsignedTx,
      },
      includeChange
    );
  }
  throw new Error('IReceivers Unimplemented');
}

export function copySignRequest<
  T: RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput
>(
  signRequest: BaseSignRequest<T>
): BaseSignRequest<T> {
  const unsignedTx = signRequest.unsignedTx;
  if (unsignedTx instanceof RustModule.WalletV2.Transaction) {
    /**
     * Signing a tx is a destructive operation in Rust
     * We create a copy of the tx so the user can retry if they get the password wrong
     */
    return {
      changeAddr: signRequest.changeAddr,
      senderUtxos: signRequest.senderUtxos,
      certificate: signRequest.certificate,
      unsignedTx: unsignedTx.clone(),
    };
  }
  if (unsignedTx instanceof RustModule.WalletV3.InputOutput) {
    return signRequest;
  }
  throw new Error('copySignRequest Unimplemented');
}

export function ITxEqual(
  req1: ?BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
  req2: ?BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
): boolean {
  if (req1 == null) {
    if (req2 == null) {
      return true;
    }
    return false;
  }
  const unsignedTx1 = req1.unsignedTx;
  if (req2 == null) {
    return false;
  }
  const unsignedTx2 = req2.unsignedTx;
  if (
    unsignedTx1 instanceof RustModule.WalletV2.Transaction &&
    unsignedTx2 instanceof RustModule.WalletV2.Transaction
  ) {
    return byronTxEqual(unsignedTx1, unsignedTx2);
  }
  if (
    unsignedTx1 instanceof RustModule.WalletV3.InputOutput &&
    unsignedTx2 instanceof RustModule.WalletV3.InputOutput
  ) {
    return shelleyTxEqual(unsignedTx1, unsignedTx2);
  }
  return false;
}
