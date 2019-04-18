// @flow
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import type {
  AdaAddress,
  AdaTransactionInputOutput,
  Transaction,
  AdaTransaction,
  AdaTransactionCondition,
  UTXO,
} from '../adaTypes';
import type { TransactionExportRow } from '../../export';
import { LOVELACES_PER_ADA } from '../../../config/numbersConfig';
import { getCurrentAccountIndex } from '../adaLocalStorage';

export const toAdaTx = function (
  amount: BigNumber,
  tx: Transaction,
  inputs: Array<AdaTransactionInputOutput>,
  isOutgoing: boolean,
  outputs: Array<AdaTransactionInputOutput>
): AdaTransaction {
  return {
    ctAmount: {
      getCCoin: amount.toString()
    },
    ctBlockNumber: Number(tx.block_num || ''),
    ctId: tx.hash,
    ctInputs: inputs,
    ctIsOutgoing: isOutgoing,
    ctMeta: {
      ctmDate: new Date(tx.time),
      ctmDescription: undefined,
      ctmTitle: undefined,
      ctmUpdate: new Date(tx.last_update)
    },
    ctOutputs: outputs,
    ctCondition: _getTxCondition(tx.tx_state)
  };
};

/** Map database format to AdaTransaction format */
export function mapToAdaTxs(
  txs: Array<Transaction>,
  accountAddresses: Array<string>
): Array<AdaTransaction> {
  return txs.map(tx => {
    // all of these depend on the set of all addresses in the user's wallet
    // so we calculate it here instead
    const inputs = _mapInputOutput(tx.inputs_address, tx.inputs_amount);
    const outputs = _mapInputOutput(tx.outputs_address, tx.outputs_amount);
    const { isOutgoing, amount } = _spenderData(inputs, outputs, accountAddresses);

    return toAdaTx(amount, tx, inputs, isOutgoing, outputs);
  });
}

/** Map database format for historic transactions to AdaTransactionInputOutput format */
function _mapInputOutput(
  addresses: Array<string>,
  amounts: Array<string>
): Array<AdaTransactionInputOutput> {
  return addresses.map((address, index) => [address, { getCCoin: amounts[index] }]);
}

/** Calculate whether transaction is ingoing/outgoing and how was sent out */
function _spenderData(
  txInputs: Array<AdaTransactionInputOutput>,
  txOutputs: Array<AdaTransactionInputOutput>,
  addresses: Array<string>
): {
  isOutgoing: boolean,
  amount: BigNumber
} {
  // Utility func to sum & count up all inputs (or outputs) of a transaction that belong to user
  const sum = toSum => (
    toSum.reduce(
      ({ totalAmount, count }, [address, { getCCoin }]) => {
        // if it doesn't belong to the user, just skip
        if (addresses.indexOf(address) < 0) return { totalAmount, count };

        return {
          totalAmount: totalAmount.plus(new BigNumber(getCCoin)),
          count: count + 1
        };
      },
      {
        totalAmount: new BigNumber(0),
        count: 0
      }
    )
  );

  const incoming = sum(txOutputs);
  const outgoing = sum(txInputs);

  const isOutgoing = outgoing.totalAmount.greaterThanOrEqualTo(
    incoming.totalAmount
  );

  // Note: this also counts redemption transactions as self transactions
  const isSelfTransaction =
    incoming.count === txInputs.length &&
    outgoing.count === txOutputs.length;

  let amount; // represents how much sender sent out
  if (isOutgoing || isSelfTransaction) amount = outgoing.totalAmount.minus(incoming.totalAmount);
  else amount = incoming.totalAmount.minus(outgoing.totalAmount);

  return {
    isOutgoing,
    amount
  };
}

/** Convert TxState from icarus-importer to AdaTransactionCondition */
const _getTxCondition = (state: string): AdaTransactionCondition => {
  if (state === 'Successful') return 'CPtxInBlocks';
  if (state === 'Pending') return 'CPtxApplying';
  return 'CPtxWontApply';
};

export function convertAdaTransactionsToExportRows(
  transactions: Array<AdaTransaction>
): Array<TransactionExportRow> {
  return transactions
    .filter(tx => tx.ctCondition === 'CPtxInBlocks')
    .map(tx => {
      const fullValue = new BigNumber(tx.ctAmount.getCCoin);
      const sumInputs: BigNumber = sumInputsOutputs(tx.ctInputs);
      const sumOutputs: BigNumber = sumInputsOutputs(tx.ctOutputs);
      const fee: BigNumber = tx.ctIsOutgoing ? sumInputs.sub(sumOutputs) : new BigNumber(0);
      const value: BigNumber = tx.ctIsOutgoing ? fullValue.sub(fee) : fullValue;
      return {
        date: tx.ctMeta.ctmDate,
        type: tx.ctIsOutgoing ? 'out' : 'in',
        amount: formatBigNumberToFloatString(value.dividedBy(LOVELACES_PER_ADA)),
        fee: formatBigNumberToFloatString(fee.dividedBy(LOVELACES_PER_ADA)),
      };
    });
}

/**
 * Ignore first string parts of inputs/outputs and just sum coin values.
 */
export function sumInputsOutputs(ios: Array<AdaTransactionInputOutput>): BigNumber {
  return ios
    .map(io => new BigNumber(io[1].getCCoin))
    .reduce((a: BigNumber, b: BigNumber) => a.add(b), new BigNumber(0));
}

/**
 * If specified number is integer - append `.0` to it.
 * Otherwise - just float representation.
 */
export function formatBigNumberToFloatString(x: BigNumber): string {
  return x.isInteger() ? x.toFixed(1) : x.toString();
}

/**
 * Note: returns -1 if no used addresses exist
 */
export function getLatestUsedIndex(addresses: Array<AdaAddress>): number {
  const usedAddresses = addresses.filter(address => address.cadIsUsed);
  if (usedAddresses.length === 0) {
    return -1;
  }

  return Math.max(
    ...usedAddresses
      .map(address => address.index)
  );
}

export type UtxoLookupMap = { [string]: { [number]: UTXO }};
export function utxosToLookupMap(
  utxos: Array<UTXO>
): UtxoLookupMap {
  // first create 1-level map of (tx_hash -> [UTXO])
  const txHashMap = _.groupBy(utxos, utxo => utxo.tx_hash);

  // now create 2-level map of (tx_hash -> index -> UTXO)
  const lookupMap = _.mapValues(
    txHashMap,
    utxoList => _.keyBy(
      utxoList,
      utxo => utxo.tx_index
    )
  );
  return lookupMap;
}

export function derivePathAsString(chain: number, addressIndex: number): string {
  const account = getCurrentAccountIndex();
  // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
  return `m/44'/1815'/${account}'/${chain}/${addressIndex}`;
}

export function derivePathPrefix(): string {
  const account = getCurrentAccountIndex();
  // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
  return `m/44'/1815'/${account}'`;
}
