// @flow
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import type {
  AdaTransactionInputOutput,
  BaseSignRequest,
  Transaction,
  AdaTransaction,
  AdaTransactionCondition,
  UTXO,
} from '../adaTypes';
import type { TransactionExportRow } from '../../export';
import { DECIMAL_PLACES_IN_ADA, LOVELACES_PER_ADA } from '../../../config/numbersConfig';
import { RustModule } from './cardanoCrypto/rustLoader';

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

  const isOutgoing = outgoing.totalAmount.isGreaterThanOrEqualTo(
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
      const fee: BigNumber = tx.ctIsOutgoing ? sumInputs.minus(sumOutputs) : new BigNumber(0);
      const value: BigNumber = tx.ctIsOutgoing ? fullValue.minus(fee) : fullValue;
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
    .reduce((a: BigNumber, b: BigNumber) => a.plus(b), new BigNumber(0));
}

/**
 * If specified number is integer - append `.0` to it.
 * Otherwise - just float representation.
 */
export function formatBigNumberToFloatString(x: BigNumber): string {
  return x.isInteger() ? x.toFixed(1) : x.toString();
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

export function derivePathAsString(
  accountIndex: number,
  chain: number,
  addressIndex: number
): string {
  // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
  return `m/44'/1815'/${accountIndex}'/${chain}/${addressIndex}`;
}

export function derivePathPrefix(accountIndex: number): string {
  // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
  return `m/44'/1815'/${accountIndex}'`;
}

export function coinToBigNumber(coin: RustModule.Wallet.Coin): BigNumber {
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

  const tx: TransactionType = req.unsignedTx.to_json();
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
    .map(val => new BigNumber(val.value))
    .reduce((sum, val) => sum.plus(val), new BigNumber(0));

  let result = inputTotal.minus(change);
  if (shift) {
    result = result.shiftedBy(-DECIMAL_PLACES_IN_ADA);
  }
  return result;
}

export function signRequestReceivers(req: BaseSignRequest, includeChange: boolean): Array<string> {
  const tx: TransactionType = req.unsignedTx.to_json();
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
    addressesMap: req.addressesMap,
    changeAddr: req.changeAddr,
    senderUtxos: req.senderUtxos,
    unsignedTx: req.unsignedTx.clone(),
  };
}
