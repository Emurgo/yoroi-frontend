// @flow
import _ from 'lodash';
import { Wallet } from 'rust-cardano-crypto';
import {
  getUTXOsForAddresses,
  sendTx
} from '../lib/yoroi-backend-api';
import {
  mapToList
} from '../lib/utils';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import {
  saveAdaAddress,
  removeAdaAddress,
  createAdaAddress,
  getAdaAddressesMap,
  getAdaAddressesList
} from '../adaAddress';
import {
  getCryptoWalletFromMasterKey,
  generateWalletMasterKey,
  generateAdaMnemonic,
} from '../lib/cardanoCrypto/cryptoWallet';
import { getResultOrFail } from '../lib/cardanoCrypto/cryptoUtils';
import type {
  AdaAddresses,
  AdaAddress,
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
import { getSingleCryptoAccount, getWalletMasterKey } from '../adaLocalStorage';
import type { ConfigType } from '../../../../config/config-types';

declare var CONFIG : ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;

const fakePassword = 'fake';

export function getAdaTransactionFee(
  receiver: string,
  amount: string
): Promise<AdaTransactionFee> {
  const fakeWalletMasterKey = generateWalletMasterKey(generateAdaMnemonic().join(' '), fakePassword);
  return _getAdaTransaction(
    receiver,
    amount,
    getCryptoWalletFromMasterKey(fakeWalletMasterKey, fakePassword)
  )
    .then(response => {
      const [{ fee }] = response;
      return { getCCoin: fee };
    })
    .catch(err => {
      Logger.error('adaNetTransactions::getAdaTransactionFee error: ' + stringifyError(err));
      const notEnoughFunds = err.message === 'NotEnoughInput';
      if (notEnoughFunds) throw new NotEnoughMoneyToSendError();
      throw new TransactionError(err.message);
    });
}

export async function newAdaTransaction(
  receiver: string,
  amount: string,
  password: string
): Promise<any> {
  const masterKey = getWalletMasterKey();
  const cryptoWallet = getCryptoWalletFromMasterKey(masterKey, password);
  // eslint-disable-next-line camelcase
  const [{ cbor_encoded_tx, changed_used }, changeAdaAddr] =
    await _getAdaTransaction(receiver, amount, cryptoWallet);
  const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
  if (changed_used) { // eslint-disable-line camelcase
    await saveAdaAddress(changeAdaAddr, 'Internal');
  }
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
    const promises = groupsOfAddresses
      .map(groupOfAddresses => getUTXOsForAddresses(groupOfAddresses));
    return Promise.all(promises)
      .then(groupsOfUTXOs => (
        groupsOfUTXOs.reduce((acc, groupOfUTXOs) => acc.concat(groupOfUTXOs), [])
      ));
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
): Promise<[SpendResponse, AdaAddress]> {
  const cryptoAccount = getSingleCryptoAccount();
  const addressesMap = await getAdaAddressesMap();
  const addresses = mapToList(addressesMap);
  const changeAdaAddr = await createAdaAddress(cryptoAccount, addresses, 'Internal');
  const changeAddr = changeAdaAddr.cadId;
  const outputs = [{ address: receiver, value: amount }];
  const senderUtxos = await getAllUTXOsForAddresses(_getAddresses(senders));
  const inputs = _mapUTXOsToInputs(senderUtxos, addressesMap);
  const result: SpendResponse = getResultOrFail(
    Wallet.spend(cryptoWallet, inputs, outputs, changeAddr)
  );
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
