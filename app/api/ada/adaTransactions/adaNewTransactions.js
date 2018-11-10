// @flow

// Handles interfacing w/ lovefieldDB and rust-cardano to create transaction

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

/** Calculate the transaction fee without actually sending the transaction */
export function getAdaTransactionFee(
  receiver: string,
  amount: string
): Promise<AdaTransactionFee> {
  // To calculate what the transaction fee would be without requiring the user to enter their password
  // We create a fake mnemonic with a fixed contant password
  const fakePassword = 'fake';
  const fakeWalletMasterKey = generateWalletMasterKey(generateAdaMnemonic().join(' '), fakePassword);
  return _getAdaTransaction(
    receiver,
    amount,
    getCryptoWalletFromMasterKey(fakeWalletMasterKey, fakePassword)
  )
    // we extract the fee since it's all we care about
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

/** Send a transaction and save the new change address */
export async function newAdaTransaction(
  receiver: string,
  amount: string,
  password: string
): Promise<Array<void>> {
  const masterKey = getWalletMasterKey();
  const cryptoWallet = getCryptoWalletFromMasterKey(masterKey, password);
  // eslint-disable-next-line camelcase
  const [{ cbor_encoded_tx, changed_used }, changeAdaAddr] =
    await _getAdaTransaction(receiver, amount, cryptoWallet);
  const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
  if (changed_used) { // eslint-disable-line camelcase
    // tentatively assume the transaction will success to we save the change address to the wallet
    await saveAdaAddress(changeAdaAddr, 'Internal');
  }
  try {
    const backendResponse = await sendTx(signedTx);
    return backendResponse;
  } catch (sendTxError) {
    // On failure, we have to remove the change address we eagerly added
    // Note: we don't await on this
    removeAdaAddress(changeAdaAddr);
    Logger.error('adaNewTransactions::newAdaTransaction error: ' +
      stringifyError(sendTxError));
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    }
    throw new SendTransactionError();
  }
}

/** Sum up the UTXO for a list of addresses by batching backend requests */
export async function getAllUTXOsForAddresses(
  addresses: Array<string>
): Promise<Array<UTXO>> {
  try {
    // split up all addresses into chunks of equal size
    const groupsOfAddresses = _.chunk(addresses, CONFIG.app.addressRequestSize);

    // convert chunks into list of Promises that call the backend-service
    const promises = groupsOfAddresses
      .map(groupOfAddresses => getUTXOsForAddresses(groupOfAddresses));

    // Sum up all the utxo
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

/** Perform the cryptography required to create a transaction */
export async function getAdaTransactionFromSenders(
  senders: AdaAddresses,
  receiver: string,
  amount: string,
  cryptoWallet: CryptoWallet
): Promise<[SpendResponse, AdaAddress]> {
  // Get all addresses in the single account to a list
  const cryptoAccount = getSingleCryptoAccount();
  const addressesMap = await getAdaAddressesMap();
  const addresses = mapToList(addressesMap);

  // fetch new internal address from HD Wallet for change
  const changeAdaAddr = await createAdaAddress(cryptoAccount, addresses, 'Internal');
  const changeAddr = changeAdaAddr.cadId;

  // Get all user UTXOs
  const senderUtxos = await getAllUTXOsForAddresses(_addressesToPublicHash(senders));

  // Consider any UTXO as a possible input
  const inputs = _mapUTXOsToInputs(senderUtxos, addressesMap);
  const outputs = [{ address: receiver, value: amount }];

  // Note: selection policy is decided on the js-cardano-wasm side
  const result: SpendResponse = getResultOrFail(
    Wallet.spend(cryptoWallet, inputs, outputs, changeAddr)
  );
  return [result, changeAdaAddr];
}

/** Perform the cryptography required to create a transaction */
async function _getAdaTransaction(
  receiver: string,
  amount: string,
  cryptoWallet: CryptoWallet,
): Promise<[SpendResponse, AdaAddress]> {
  // Consider all user addresses valid for the source of a transaction
  const senders = await getAdaAddressesList();
  return getAdaTransactionFromSenders(senders, receiver, amount, cryptoWallet);
}

function _addressesToPublicHash(
  adaAddresses: AdaAddresses
): Array<string> {
  return adaAddresses.map(addr => addr.cadId);
}

function _mapUTXOsToInputs(
  utxos: Array<UTXO>,
  adaAddressesMap
): Array<TxInput> {
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
