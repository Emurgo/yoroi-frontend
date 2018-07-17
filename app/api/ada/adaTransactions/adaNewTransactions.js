// @flow
import _ from 'lodash';
import { Wallet } from 'rust-cardano-crypto';
import {
  getUTXOsForAddresses,
  addressesLimit,
  sendTx
} from '../lib/icarus-backend-api';
import {
  mapToList
} from '../lib/utils';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import {
  getWalletSeed
} from '../adaWallet';
import { getSingleCryptoAccount } from '../adaAccount';
import {
  saveAdaAddress,
  removeAdaAddress,
  createAdaAddress,
  getAdaAddressesMap,
  getAdaAddressesList
} from '../adaAddress';
import {
  getCryptoWalletFromSeed,
  generateWalletSeed,
  generateAdaMnemonic,
} from '../lib/cardanoCrypto/cryptoWallet';
import type { WalletSeed } from '../lib/cardanoCrypto/cryptoWallet';
import { getOrFail } from '../lib/cardanoCrypto/cryptoUtils';
import type {
  AdaAddresses,
  AdaTransactionFee,
  UTXO
} from '../adaTypes';
import {
  NotEnoughMoneyToSendError,
  TransactionError,
  SendTransactionError,
  GetAllUTXOsForAddressesError,
  InvalidWitnessError
} from '../errors';
import { IncorrectWalletPasswordError } from '../../common';
import { WrongPassphraseError } from '../lib/cardanoCrypto/cryptoErrors';

const fakePassword = 'fake';

export function getAdaTransactionFee(
  receiver: string,
  amount: string
): Promise<AdaTransactionFee> {
  const fakeWalletSeed = generateWalletSeed(generateAdaMnemonic().join(' '), fakePassword);
  return _getAdaTransaction(receiver, amount, getCryptoWalletFromSeed(fakeWalletSeed, fakePassword))
    .then(response => {
      const [{ fee }] = response;
      return { getCCoin: fee };
    })
    .catch(err => {
      const notEnoughFunds = err.message === 'FeeCalculationError(NotEnoughInput)' ||
        err.message === 'FeeCalculationError(NoInputs)';
      if (notEnoughFunds) throw new NotEnoughMoneyToSendError();
      throw new TransactionError(err.message);
    });
}

export async function newAdaTransaction(
  receiver: string,
  amount: string,
  password: string
): Promise<any> {
  const seed = getWalletSeed();
  const cryptoWallet = _getCryptoWalletFromSeed(seed, password);
  const [{ cbor_encoded_tx }, changeAdaAddr] =
    await _getAdaTransaction(receiver, amount, cryptoWallet);
  const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
  await saveAdaAddress(changeAdaAddr, 'Internal');
  try {
    const backendResponse = await sendTx(signedTx);
    return backendResponse;
  } catch (sendTxError) {
    removeAdaAddress(changeAdaAddr);
    Logger.error('adaNewTransactions::newAdaTransaction error: ' +
      stringifyError(sendTxError));
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    }
    throw new SendTransactionError();
  }
}

export async function getAllUTXOsForAddresses(
  addresses: Array<string>
): Promise<Array<UTXO>> {
  try {
    const groupsOfAddresses = _.chunk(addresses, addressesLimit);
    const promises = groupsOfAddresses.map(groupOfAddresses =>
      getUTXOsForAddresses(groupOfAddresses));
    return Promise.all(promises).then(groupsOfUTXOs =>
      groupsOfUTXOs.reduce((acc, groupOfUTXOs) => acc.concat(groupOfUTXOs), []));
  } catch (getUtxosError) {
    Logger.error('adaNewTransactions::getAllUTXOsForAddresses error: ' +
      stringifyError(getUtxosError));
    throw new GetAllUTXOsForAddressesError();
  }
}

export async function getAdaTransactionFromSenders(
  senders: AdaAddresses,
  receiver: string,
  amount: string,
  cryptoWallet: CryptoWallet
) {
  const cryptoAccount = getSingleCryptoAccount();
  const addressesMap = await getAdaAddressesMap();
  const addresses = mapToList(addressesMap);
  const changeAdaAddr = await createAdaAddress(cryptoAccount, addresses, 'Internal');
  const changeAddr = changeAdaAddr.cadId;
  const outputs = [{ address: receiver, value: amount }];
  const senderUtxos = await getAllUTXOsForAddresses(_getAddresses(senders));
  const inputs = _mapUTXOsToInputs(senderUtxos, addressesMap);
  const result = getOrFail(Wallet.spend(cryptoWallet, inputs, outputs, changeAddr));
  return [result, changeAdaAddr];
}

async function _getAdaTransaction(
  receiver: string,
  amount: string,
  cryptoWallet: CryptoWallet,
) {
  const senders = await getAdaAddressesList();
  return getAdaTransactionFromSenders(senders, receiver, amount, cryptoWallet);
}

function _getAddresses(
  adaAddresses: AdaAddresses
): Array<string> {
  return adaAddresses.map(addr => addr.cadId);
}

function _mapUTXOsToInputs(utxos, adaAddressesMap) {
  return utxos.map((utxo) => ({
    ptr: {
      index: utxo.tx_index,
      id: utxo.tx_hash
    },
    value: {
      address: utxo.receiver,
      value: utxo.amount
    },
    addressing: {
      account: adaAddressesMap[utxo.receiver].account,
      change: adaAddressesMap[utxo.receiver].change,
      index: adaAddressesMap[utxo.receiver].index
    }
  }));
}

function _getCryptoWalletFromSeed(
  seed: WalletSeed,
  password: string
): CryptoWallet {
  try {
    return getCryptoWalletFromSeed(seed, password);
  } catch (error) {
    if (error instanceof WrongPassphraseError) {
      throw new IncorrectWalletPasswordError();
    }
    throw error;
  }
}
