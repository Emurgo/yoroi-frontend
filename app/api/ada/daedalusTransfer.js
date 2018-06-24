// @flow
import BigNumber from 'bignumber.js';
import {
  RandomAddressChecker,
  Wallet
} from 'rust-cardano-crypto';
import { LOVELACES_PER_ADA } from '../../config/numbersConfig';
import { getBalance } from './adaWallet';
import {
  mapToList
} from './lib/utils';
import {
  getCryptoDaedalusWalletFromMnemonics
} from './lib/crypto-wallet';
import {
  getAdaAddressesMap,
  filterAdaAddressesByType
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

// FIXME: Handle rust errors
export function getAddressesWithFunds(payload: {
  secretWords: string,
  addresses: Array<string>
}): Array<CryptoDaedalusAddressRestored> {
  const { secretWords, addresses } = payload;
  const checker =
    RandomAddressChecker.newCheckerFromMnemonics(secretWords).result;
  const addressesWithFunds =
    RandomAddressChecker.checkAddresses(checker, addresses).result;
  return addressesWithFunds;
}

// FIXME: Handle rust and backend errors
export async function generateTransferTx(payload: {
  secretWords: string,
  addressesWithFunds: Array<CryptoDaedalusAddressRestored>
}): Promise<TransferTx> {
  const { secretWords, addressesWithFunds } = payload;
  const senders = addressesWithFunds.map(a => a.address);
  const senderUtxos = await getAllUTXOsForAddresses(senders);
  const recoveredBalance = await getBalance(senders);
  const wallet = getCryptoDaedalusWalletFromMnemonics(secretWords);
  const inputs = _getInputs(senderUtxos, addressesWithFunds);
  const output = _getReceiverAddress();
  const tx = Wallet.move(wallet, inputs, output).result;
  return {
    recoveredBalance: recoveredBalance.dividedBy(LOVELACES_PER_ADA),
    fee: new BigNumber(tx.fee).dividedBy(LOVELACES_PER_ADA),
    cborEncodedTx: tx.cbor_encoded_tx,
    senders,
    receiver: output
  };
}

function _getReceiverAddress(): string {
  const addressesMap = getAdaAddressesMap();
  const addresses = mapToList(addressesMap);
  return filterAdaAddressesByType(addresses, 'External')[0].cadId;
}

function _getInputs(
  utxos: Array<UTXO>,
  addressesWithFunds: Array<CryptoDaedalusAddressRestored>
): Array<TxDaedalusInput> {
  const addressingByAddress = {};
  addressesWithFunds.forEach(a => {
    addressingByAddress[a.address] = a.addressing;
  });
  return utxos.map(utxo => {
    return {
      ptr: {
        index: utxo.tx_index,
        id: utxo.tx_hash
      },
      value: utxo.amount,
      addressing: addressingByAddress[utxo.receiver]
    };
  });
}
