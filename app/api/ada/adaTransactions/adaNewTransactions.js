// @flow

// Handles interfacing w/ lovefieldDB and rust-cardano to create transaction

import _ from 'lodash';
import {
  getUTXOsForAddresses,
  sendTx
} from '../lib/yoroi-backend-api';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import {
  addressesToAddressMap,
  getAdaAddressesList,
  popBip44Address
} from '../adaAddress';
import {
  getCryptoWalletFromMasterKey,
} from '../lib/cardanoCrypto/cryptoWallet';
import type {
  AdaAddress,
  AdaFeeEstimateResponse,
  UTXO,
  UnsignedTxResponse,
} from '../adaTypes';
import {
  NotEnoughMoneyToSendError,
  SendTransactionError,
  GetAllUTXOsForAddressesError,
  InvalidWitnessError
} from '../errors';
import { getWalletMasterKey, getCurrentAccountIndex } from '../adaLocalStorage';
import type { ConfigType } from '../../../../config/config-types';
import { HARD_DERIVATION_START } from '../../../config/numbersConfig';
import type { AdaAddressMap } from '../adaAddress';
import { utxosToLookupMap } from '../lib/utils';
import type { SignedResponse } from '../lib/yoroi-backend-api';

import { RustModule } from '../lib/cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

/** Calculate the transaction fee without actually sending the transaction */
export async function getAdaTransactionFee(
  receiver: string,
  amount: string
): Promise<AdaFeeEstimateResponse> {
  const { txBuilder } = await newAdaUnsignedTx(receiver, amount);
  const fee = txBuilder.estimate_fee(RustModule.Wallet.LinearFeeAlgorithm.default());
  return { fee: fee.to_str() };
}

export async function newAdaUnsignedTx(
  receiver: string,
  amount: string,
): Promise<UnsignedTxResponse> {
  const changeAdaAddr: AdaAddress = await popBip44Address('Internal');
  const changeAddr = RustModule.Wallet.Address.from_base58(changeAdaAddr.cadId);
  const outputPolicy = RustModule.Wallet.OutputPolicy.change_to_one_address(changeAddr);
  const feeAlgorithm = RustModule.Wallet.LinearFeeAlgorithm.default();

  const allAdaAddresses = await getAdaAddressesList();
  const allUtxos = await getAllUTXOsForAddresses(allAdaAddresses.map(addr => addr.cadId));
  const txInputs = utxoToTxInput(allUtxos);
  let selectionResult;
  try {
    selectionResult = getInputSelection(txInputs, outputPolicy, feeAlgorithm, receiver, amount);
  } catch (err) {
    throw new NotEnoughMoneyToSendError();
  }
  const senderInputs = txInputs.filter(input => (
    selectionResult.is_input(
      RustModule.Wallet.TxoPointer.from_json(input.to_json().ptr)
    )
  ));

  const usedAddressSet = new Set(senderInputs.map(input => input.to_json().value.address));
  const usedAdaAddresses = allAdaAddresses.filter(
    adaAddress => usedAddressSet.has(adaAddress.cadId)
  );

  const txBuilder = new RustModule.Wallet.TransactionBuilder();
  await addTxIO(txBuilder, senderInputs, outputPolicy, feeAlgorithm, receiver, amount);
  return {
    addressesMap: addressesToAddressMap(usedAdaAddresses),
    changeAddr: changeAdaAddr,
    senderUtxos: filterUtxo(senderInputs, allUtxos),
    txBuilder,
  };
}

/** Send a transaction and save the new change address */
export async function newAdaSignedTx(
  receiver: string,
  amount: string,
  password: string
): Promise<SignedResponse> {
  const masterKey = getWalletMasterKey();
  const cryptoWallet = getCryptoWalletFromMasterKey(masterKey, password);

  const { addressesMap, senderUtxos, txBuilder } = await newAdaUnsignedTx(receiver, amount);
  const unsignedTx = txBuilder.make_transaction();
  const txFinalizer = new RustModule.Wallet.TransactionFinalized(unsignedTx);
  signTransaction(
    txFinalizer,
    senderUtxos,
    addressesMap,
    cryptoWallet
  );
  const signedTx = txFinalizer.finalize();
  try {
    return await sendTx({ signedTx });
  } catch (sendTxError) {
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
      .map(groupOfAddresses => getUTXOsForAddresses(
        { addresses: groupOfAddresses }
      ));

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

export function utxoToTxInput(
  utxos: Array<UTXO>,
): Array<RustModule.Wallet.TxInput> {
  return utxos.map(utxo => {
    const txoPointer = RustModule.Wallet.TxoPointer.new(
      RustModule.Wallet.TransactionId.from_hex(utxo.tx_hash),
      utxo.tx_index
    );
    const txOut = RustModule.Wallet.TxOut.new(
      RustModule.Wallet.Address.from_base58(utxo.receiver),
      RustModule.Wallet.Coin.from_str(utxo.amount),
    );
    return RustModule.Wallet.TxInput.new(txoPointer, txOut);
  });
}

export function filterUtxo(
  inputs: Array<RustModule.Wallet.TxInput>,
  utxos: Array<UTXO>,
): Array<UTXO> {
  const lookupMap = utxosToLookupMap(utxos);

  return inputs.map(input => {
    const txoPointer = input.to_json().ptr;
    return lookupMap[txoPointer.id][txoPointer.index];
  });
}

function getInputSelection(
  allInputs: Array<RustModule.Wallet.TxInput>,
  outputPolicy: RustModule.Wallet.OutputPolicy,
  feeAlgorithm: RustModule.Wallet.LinearFeeAlgorithm,
  receiver: string,
  amount: string,
): RustModule.Wallet.InputSelectionResult {
  const inputSelection = RustModule.Wallet.InputSelectionBuilder.first_match_first();
  allInputs.forEach(input => inputSelection.add_input(input));
  addOutput(inputSelection, receiver, amount);
  return inputSelection.select_inputs(feeAlgorithm, outputPolicy);
}

export async function addTxIO(
  txBuilder: RustModule.Wallet.TransactionBuilder,
  senderInputs: Array<RustModule.Wallet.TxInput>,
  outputPolicy: RustModule.Wallet.OutputPolicy,
  feeAlgorithm: RustModule.Wallet.LinearFeeAlgorithm,
  receiver: string,
  amount: string,
): Promise<void> {
  addTxInputs(txBuilder, senderInputs);
  addOutput(txBuilder, receiver, amount);

  try {
    txBuilder.apply_output_policy(
      feeAlgorithm,
      outputPolicy
    );
  } catch (err) {
    throw new NotEnoughMoneyToSendError();
  }

  const balance = txBuilder.get_balance(feeAlgorithm);
  if (balance.is_negative()) {
    throw new NotEnoughMoneyToSendError();
  }
}

export function signTransaction(
  txFinalizer: RustModule.Wallet.TransactionFinalized,
  senderUtxos: Array<UTXO>,
  addressesMap: AdaAddressMap,
  cryptoWallet: RustModule.Wallet.Bip44RootPrivateKey,
): void {
  const currAccount = getCurrentAccountIndex();
  const accountPrivateKey = cryptoWallet.bip44_account(
    RustModule.Wallet.AccountIndex.new(currAccount | HARD_DERIVATION_START)
  );

  // get private keys
  const privateKeys = senderUtxos.map(utxo => {
    const addressInfo = addressesMap[utxo.receiver];
    return accountPrivateKey.address_key(
      addressInfo.change === 1, // is internal
      RustModule.Wallet.AddressKeyIndex.new(addressInfo.index)
    );
  });

  // sign the transactions
  const setting = RustModule.Wallet.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
  });
  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = RustModule.Wallet.Witness.new_extended_key(
      setting,
      privateKeys[i],
      txFinalizer.id()
    );
    txFinalizer.add_witness(witness);
  }
}

export function addTxInputs(
  txBuilder: RustModule.Wallet.TransactionBuilder,
  senderInputs: Array<RustModule.Wallet.TxInput>,
): void {
  senderInputs.forEach(input => {
    const jsonInput = input.to_json();
    txBuilder.add_input(
      RustModule.Wallet.TxoPointer.from_json(jsonInput.ptr),
      RustModule.Wallet.Coin.from_str(jsonInput.value.value)
    );
  });
}

export function addOutput(
  builder: RustModule.Wallet.TransactionBuilder | RustModule.Wallet.InputSelectionBuilder,
  address: string,
  value: string, // in lovelaces
): void {
  const txOut = RustModule.Wallet.TxOut.new(
    RustModule.Wallet.Address.from_base58(address),
    RustModule.Wallet.Coin.from_str(value),
  );
  builder.add_output(txOut);
}
