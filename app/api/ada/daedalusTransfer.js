// @flow

// Handle data created by wallets using the v1 address scheme

import BigNumber from 'bignumber.js';
import _ from 'lodash';
import {
  RandomAddressChecker,
  Wallet
} from 'rust-cardano-crypto';
import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import { getResultOrFail } from './lib/cardanoCrypto/cryptoUtils';
import { LOVELACES_PER_ADA } from '../../config/numbersConfig';
import { getBalance } from './adaWallet';
import {
  GetAddressesWithFundsError,
  NoInputsError,
  GenerateTransferTxError
} from './errors';
import {
  getCryptoDaedalusWalletFromMnemonics
} from './lib/cardanoCrypto/cryptoWallet';
import {
  getAllUTXOsForAddresses
} from './adaTransactions/adaNewTransactions';
import type {
  UTXO
} from './adaTypes';
import type {
  TransferTx
} from '../../types/TransferTypes';
import { getReceiverAddress } from './adaAddress';

/** Go through the whole UTXO and see which belong to the walet and have non-empty balance
 * @param fullUtxo the full utxo of the Cardano blockchain
 */
export function getAddressesWithFunds(payload: {
  secretWords: string,
  fullUtxo: Array<string>
}): Array<CryptoDaedalusAddressRestored> {
  try {
    const { secretWords, fullUtxo } = payload;
    const checker: CryptoAddressChecker = getResultOrFail(
      RandomAddressChecker.newCheckerFromMnemonics(secretWords)
    );
    const addressesWithFunds: Array<CryptoDaedalusAddressRestored> = getResultOrFail(
      RandomAddressChecker.checkAddresses(checker, fullUtxo)
    );
    return addressesWithFunds;
  } catch (error) {
    Logger.error(`daedalusTransfer::getAddressesWithFunds ${stringifyError(error)}`);
    throw new GetAddressesWithFundsError();
  }
}

/** Generate transaction including all addresses with no change */
export async function generateTransferTx(payload: {
  secretWords: string,
  addressesWithFunds: Array<CryptoDaedalusAddressRestored>
}): Promise<TransferTx> {
  try {

    const { secretWords, addressesWithFunds } = payload;

    // fetch data to make transaction
    const senders = addressesWithFunds.map(a => a.address);
    const senderUtxos = await getAllUTXOsForAddresses(senders);
    if (_.isEmpty(senderUtxos)) {
      throw new NoInputsError();
    }
    const recoveredBalance = await getBalance(senders);
    const inputWrappers: Array<DaedalusInputWrapper> = _getInputs(senderUtxos, addressesWithFunds);
    const inputs = inputWrappers.map(w => w.input);

    // pick which address to send transfer to
    const output = await getReceiverAddress();

    // get wallet and make transaction
    const wallet = getCryptoDaedalusWalletFromMnemonics(secretWords);
    const tx: MoveResponse = getResultOrFail(Wallet.move(wallet, inputs, output));

    // return summary of transaction
    return {
      recoveredBalance: recoveredBalance.dividedBy(LOVELACES_PER_ADA),
      fee: new BigNumber(tx.fee).dividedBy(LOVELACES_PER_ADA),
      cborEncodedTx: tx.cbor_encoded_tx,
      senders,
      receiver: output,
    };
  } catch (error) {
    Logger.error(`daedalusTransfer::generateTransferTx ${stringifyError(error)}`);
    if (error instanceof NoInputsError) {
      throw error;
    }
    throw new GenerateTransferTxError();
  }
}

declare type DaedalusInputWrapper = {
  input: TxDaedalusInput,
  address: string
}

/** Create V1 addressing scheme inputs from Daedalus restoration info */
function _getInputs(
  utxos: Array<UTXO>,
  addressesWithFunds: Array<CryptoDaedalusAddressRestored>
): Array<DaedalusInputWrapper> {
  const addressingByAddress = {};
  addressesWithFunds.forEach(a => {
    addressingByAddress[a.address] = a.addressing;
  });
  return utxos.map(utxo => ({
    input: {
      ptr: {
        index: utxo.tx_index,
        id: utxo.tx_hash
      },
      value: utxo.amount,
      addressing: addressingByAddress[utxo.receiver]
    },
    address: utxo.receiver
  }));
}
