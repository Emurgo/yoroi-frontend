// @flow

import {
  NotEnoughMoneyToSendError,
} from '../../../common/errors';
import type { RemoteUnspentOutput, } from '../state-fetch/types';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

export function selectAllInputSelection(
  txBuilder: RustModule.WalletV3.InputOutputBuilder,
  allUtxos: Array<RemoteUnspentOutput>,
  feeAlgorithm: RustModule.WalletV3.Fee,
  payload: RustModule.WalletV3.Payload,
): Array<RemoteUnspentOutput> {
  const selectedOutputs = [];
  if (allUtxos.length === 0) {
    throw new NotEnoughMoneyToSendError();
  }
  for (let i = 0; i < allUtxos.length; i++) {
    selectedOutputs.push(allUtxos[i]);
    txBuilder.add_input(utxoToTxInput(allUtxos[i]));
  }
  const txBalance = txBuilder.get_balance(payload, feeAlgorithm);
  if (!txBalance.is_negative()) {
    return selectedOutputs;
  }
  throw new NotEnoughMoneyToSendError();
}

export function firstMatchFirstInputSelection(
  txBuilder: RustModule.WalletV3.InputOutputBuilder,
  allUtxos: Array<RemoteUnspentOutput>,
  feeAlgorithm: RustModule.WalletV3.Fee,
  payload: RustModule.WalletV3.Payload,
): Array<RemoteUnspentOutput> {
  const selectedOutputs = [];
  if (allUtxos.length === 0) {
    throw new NotEnoughMoneyToSendError();
  }
  // add UTXOs in whatever order they're sorted until we have enough for amount+fee
  for (let i = 0; i < allUtxos.length; i++) {
    selectedOutputs.push(allUtxos[i]);
    txBuilder.add_input(utxoToTxInput(allUtxos[i]));
    const txBalance = txBuilder.get_balance(payload, feeAlgorithm);
    if (!txBalance.is_negative()) {
      break;
    }
    if (i === allUtxos.length - 1) {
      throw new NotEnoughMoneyToSendError();
    }
  }
  return selectedOutputs;
}

export function utxoToTxInput(
  utxo: RemoteUnspentOutput,
): RustModule.WalletV3.Input {
  const txoPointer = RustModule.WalletV3.UtxoPointer.new(
    RustModule.WalletV3.FragmentId.from_bytes(
      Buffer.from(utxo.tx_hash, 'hex')
    ),
    utxo.tx_index,
    RustModule.WalletV3.Value.from_str(utxo.amount),
  );
  return RustModule.WalletV3.Input.from_utxo(txoPointer);
}
