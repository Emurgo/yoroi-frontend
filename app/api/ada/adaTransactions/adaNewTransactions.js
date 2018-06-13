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
  getWalletSeed
} from '../adaWallet';
import {
  getCryptoAccount,
  ACCOUNT_INDEX
} from '../adaAccount';
import {
  saveAdaAddress,
  createAdaAddress,
  getAdaAddressesMap
} from '../adaAddress';
import { getCryptoWalletFromSeed } from '../lib/crypto-wallet';
import type {
  AdaAddresses,
  AdaTransactionFee,
} from '../adaTypes';

export const getAdaTransactionFee = (
  receiver: string,
  amount: string
): Promise<AdaTransactionFee> => {
  const password = 'FakePassword';
  return _getAdaTransaction(receiver, amount, password)
    .then((response) => {
      const result = response[0];
      // TODO: Improve Js-Wasm-cardano error handling
      if (result.failed) {
        if (result.msg === 'FeeCalculationError(NotEnoughInput)') {
          throw new Error('not enough money');
        }
      }
      return {
        getCCoin: result.result.fee
      };
    });
};

export const newAdaTransaction = (
  receiver: string,
  amount: string,
  password: string
): Promise<any> =>
  _getAdaTransaction(receiver, amount, password)
    .then(([{ result: { cbor_encoded_tx } }, changeAdaAddr]) => {
      // TODO: Handle Js-Wasm-cardano errors
      const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
      return Promise.all([sendTx(signedTx), changeAdaAddr]);
    })
    .then(([backendResponse, changeAdaAddr]) => {
      // Only if the tx was send, we should track the change Address.
      saveAdaAddress(changeAdaAddr);
      return backendResponse;
    });

async function _getAllUTXOsForAddresses(adaAddresses: AdaAddresses) {
  const groupsOfAdaAddresses = _.chunk(adaAddresses, addressesLimit);
  const promises = groupsOfAdaAddresses.map(groupOfAdaAddresses =>
    getUTXOsForAddresses(groupOfAdaAddresses.map(addr => addr.cadId)));
  return Promise.all(promises).then(groupsOfUTXOs =>
    groupsOfUTXOs.reduce((acc, groupOfUTXOs) => acc.concat(groupOfUTXOs), []));
}

function _getAdaTransaction(
  receiver: string,
  amount: string,
  password: string
) {
  const seed = getWalletSeed();
  const cryptoWallet = getCryptoWalletFromSeed(seed, password);
  const cryptoAccount = getCryptoAccount(cryptoWallet, ACCOUNT_INDEX);
  const addressesMap = getAdaAddressesMap();
  const addresses = mapToList(addressesMap);
  const changeAdaAddr = createAdaAddress(cryptoAccount, addresses, 'Internal');
  const changeAddr = changeAdaAddr.cadId;
  const outputs = [{ address: receiver, value: parseInt(amount, 10) }];
  return _getAllUTXOsForAddresses(addresses)
    .then((senderUtxos) => {
      const inputs = _mapUTXOsToInputs(senderUtxos, addressesMap);
      return [
        Wallet.spend(
          cryptoWallet,
          inputs,
          outputs,
          changeAddr),
        changeAdaAddr
      ];
    });
}

function _mapUTXOsToInputs(utxos, adaAddressesMap) {
  return utxos.map((utxo) => ({
    ptr: {
      index: utxo.tx_index,
      id: utxo.tx_hash
    },
    value: {
      address: utxo.receiver,
      // FIXME: Currently js-wasm-module support Js Number, but amounts could be BigNumber's.
      value: Number(utxo.amount)
    },
    addressing: {
      account: adaAddressesMap[utxo.receiver].account,
      change: adaAddressesMap[utxo.receiver].change,
      index: adaAddressesMap[utxo.receiver].index
    }
  }));
}
