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
import { getCryptoWalletFromSeed } from '../lib/cardanoCrypto/cryptoWallet';
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
  GetAllUTXOsForAddressesError
} from '../errors';

export function getAdaTransactionFee(
  receiver: string,
  amount: string
): Promise<AdaTransactionFee> {
  const password = 'FakePassword';
  return _getAdaTransaction(receiver, amount, password)
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
  const [{ cbor_encoded_tx }, changeAdaAddr] = await _getAdaTransaction(receiver, amount, password);
  const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
  await saveAdaAddress(changeAdaAddr, 'Internal');
  try {
    const backendResponse = await sendTx(signedTx);
    return backendResponse;
  } catch (sendTxError) {
    removeAdaAddress(changeAdaAddr);
    Logger.error('adaNewTransactions::newAdaTransaction error: ' +
      stringifyError(sendTxError));
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
  password: string
) {
  const seed = getWalletSeed();
  const cryptoWallet = getCryptoWalletFromSeed(seed, password);
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
  password: string,
) {
  const senders = await getAdaAddressesList();
  return getAdaTransactionFromSenders(senders, receiver, amount, password);
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
