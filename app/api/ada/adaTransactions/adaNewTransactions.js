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
import { getSingleCryptoAccount } from '../adaAccount';
import {
  saveAdaAddress,
  createAdaAddress,
  getAdaAddressesMap
} from '../adaAddress';
import { getCryptoWalletFromSeed } from '../lib/cardanoCrypto/cryptoWallet';
import type {
  AdaAddresses,
  AdaTransactionFee,
  UTXO
} from '../adaTypes';
import {
  NotEnoughMoneyToSendError,
  TransactionError
} from '../errors';

export function getAdaTransactionFee(
  receiver: string,
  amount: string
): Promise<AdaTransactionFee> {
  const password = 'FakePassword';
  return _getAdaTransaction(receiver, amount, password)
    .then((response) => {
      const result = response[0];
      if (result.failed) {
        const notEnoughFunds = result.msg === 'FeeCalculationError(NotEnoughInput)' ||
          result.msg === 'FeeCalculationError(NoInputs)';
        if (notEnoughFunds) {
          throw new NotEnoughMoneyToSendError();
        } else {
          throw new TransactionError();
        }
      }
      return {
        getCCoin: result.result.fee
      };
    });
}

export async function newAdaTransaction(
  receiver: string,
  amount: string,
  password: string
): Promise<any> {
  const [{ result: { cbor_encoded_tx } }, changeAdaAddr] =
    await _getAdaTransaction(receiver, amount, password);
  const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
  const backendResponse = await sendTx(signedTx);
  // Only if the tx was send, we should track the change Address.
  saveAdaAddress(changeAdaAddr);
  return backendResponse;
}

export async function getAllUTXOsForAddresses(
  addresses: Array<string>
): Promise<Array<UTXO>> {
  const groupsOfAddresses = _.chunk(addresses, addressesLimit);
  const promises = groupsOfAddresses.map(groupOfAddresses =>
    getUTXOsForAddresses(groupOfAddresses));
  return Promise.all(promises).then(groupsOfUTXOs =>
    groupsOfUTXOs.reduce((acc, groupOfUTXOs) => acc.concat(groupOfUTXOs), []));
}

export function getAdaTransactionFromSenders(
  senders: AdaAddresses,
  receiver: string,
  amount: string,
  password: string
) {
  const seed = getWalletSeed();
  const cryptoWallet = getCryptoWalletFromSeed(seed, password);
  const cryptoAccount = getSingleCryptoAccount();
  const addressesMap = getAdaAddressesMap();
  const addresses = mapToList(addressesMap);
  const changeAdaAddr = createAdaAddress(cryptoAccount, addresses, 'Internal');
  const changeAddr = changeAdaAddr.cadId;
  const outputs = [{ address: receiver, value: amount }];
  return getAllUTXOsForAddresses(_getAddresses(senders))
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

function _getAdaTransaction(
  receiver: string,
  amount: string,
  password: string,
) {
  const senders = mapToList(getAdaAddressesMap());
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
      // FIXME: Currently js-wasm-module support Js Number, but amounts could be BigNumber's.
      value: utxo.amount
    },
    addressing: {
      account: adaAddressesMap[utxo.receiver].account,
      change: adaAddressesMap[utxo.receiver].change,
      index: adaAddressesMap[utxo.receiver].index
    }
  }));
}
