// @flow
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
  getAdaAddressesByType
} from './adaAddress';
import {
  getAllUTXOsForAddresses
} from './adaTransactions/adaNewTransactions';
import type {
  UTXO
} from './adaTypes';
import type {
  TransferTx
} from '../../types/daedalusTransferTypes';

export function getAddressesWithFunds(payload: {
  secretWords: string,
  addresses: Array<string>
}): Array<CryptoDaedalusAddressRestored> {
  try {
    const { secretWords, addresses } = payload;
    const checker = getResultOrFail<CryptoAddressChecker>(
      RandomAddressChecker.newCheckerFromMnemonics(secretWords)
    );
    const addressesWithFunds = getResultOrFail<Array<CryptoDaedalusAddressRestored>>(
      RandomAddressChecker.checkAddresses(checker, addresses)
    );
    return addressesWithFunds;
  } catch (error) {
    Logger.error(`daedalusTransfer::getAddressesWithFunds ${stringifyError(error)}`);
    throw new GetAddressesWithFundsError();
  }
}

export async function generateTransferTx(payload: {
  secretWords: string,
  addressesWithFunds: Array<CryptoDaedalusAddressRestored>
}): Promise<TransferTx> {
  try {
    const { secretWords, addressesWithFunds } = payload;
    const senders = addressesWithFunds.map(a => a.address);
    const senderUtxos = await getAllUTXOsForAddresses(senders);
    if (_.isEmpty(senderUtxos)) {
      throw new NoInputsError();
    }
    const recoveredBalance = await getBalance(senders);
    const wallet = getCryptoDaedalusWalletFromMnemonics(secretWords);
    const inputs = _getInputs(senderUtxos, addressesWithFunds);
    const output = await _getReceiverAddress();
    const tx = getResultOrFail<MoveResponse>(Wallet.move(wallet, inputs, output));
    return {
      recoveredBalance: recoveredBalance.dividedBy(LOVELACES_PER_ADA),
      fee: new BigNumber(tx.fee).dividedBy(LOVELACES_PER_ADA),
      cborEncodedTx: tx.cbor_encoded_tx,
      senders,
      receiver: output
    };
  } catch (error) {
    Logger.error(`daedalusTransfer::generateTransferTx ${stringifyError(error)}`);
    if (error instanceof NoInputsError) {
      throw error;
    }
    throw new GenerateTransferTxError();
  }
}

async function _getReceiverAddress(): Promise<string> {
  const addresses = await getAdaAddressesByType('External');
  return addresses[0].cadId;
}

function _getInputs(
  utxos: Array<UTXO>,
  addressesWithFunds: Array<CryptoDaedalusAddressRestored>
): Array<TxDaedalusInput> {
  const addressingByAddress = {};
  addressesWithFunds.forEach(a => {
    addressingByAddress[a.address] = a.addressing;
  });
  return utxos.map(utxo => (
    {
      ptr: {
        index: utxo.tx_index,
        id: utxo.tx_hash
      },
      value: utxo.amount,
      addressing: addressingByAddress[utxo.receiver]
    }
  ));
}
