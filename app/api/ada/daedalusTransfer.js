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
  getAdaAddressesByType
} from './adaAddress';
import {
  getAllUTXOsForAddresses
} from './adaTransactions/adaNewTransactions';
import type {
  UTXO
} from './adaTypes';
import type {
  TransferTx,
  TxValidation
} from '../../types/TransferTypes';
import {
  derivePrivate,
  unpackAddress,
  walletSecretFromMnemonic,
  xpubToHdPassphrase
} from 'cardano-crypto.js';
import {
  createAddressRoot,
  decodeAddress,
  decodeRustTx
} from './lib/utils';

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
    const inputWrappers : Array<DaedalusInputWrapper> = _getInputs(senderUtxos, addressesWithFunds);
    const inputs = inputWrappers.map(w => w.input);

    // pick which address to send transfer to
    const output = await _getReceiverAddress();

    // get wallet and make transaction
    const wallet = getCryptoDaedalusWalletFromMnemonics(secretWords);
    const tx: MoveResponse = getResultOrFail(Wallet.move(wallet, inputs, output));

    // Validate address/witness crypto
    const inputValidation = await _validateAddressesAndSignatures(secretWords, inputWrappers, tx);
    if (inputValidation.errors.length) {
      Logger.info('Input validation errors:');
      inputValidation.errors.forEach(e => Logger.info(JSON.stringify(e)));
    }

    // return summary of transaction
    return {
      recoveredBalance: recoveredBalance.dividedBy(LOVELACES_PER_ADA),
      fee: new BigNumber(tx.fee).dividedBy(LOVELACES_PER_ADA),
      cborEncodedTx: tx.cbor_encoded_tx,
      senders,
      receiver: output,
      txValidation: inputValidation
    };
  } catch (error) {
    Logger.error(`daedalusTransfer::generateTransferTx ${stringifyError(error)}`);
    if (error instanceof NoInputsError) {
      throw error;
    }
    throw new GenerateTransferTxError();
  }
}

/**
 * Unpack and decode provided transaction and validate all addresses and witnesses
 * @return array of error descriptors, or string 'OK' is everything is ok
 */
async function _validateAddressesAndSignatures(
  secretWords: string,
  inputWrappers: Array<DaedalusInputWrapper>,
  tx: MoveResponse
): Promise<TxValidation> {
  // Validate address/witness crypto
  const witnessPubKeys = decodeRustTx(tx.cbor_encoded_tx).tx.witnesses.map(w => w.PkWitness[0]);

  try {
    const derivationScheme = 1;
    const secret = await walletSecretFromMnemonic(secretWords, derivationScheme);
    const pass = await xpubToHdPassphrase(secret.slice(64, 128));
    const errors = inputWrappers.map((inputWrapper, idx) => {
      const address = inputWrapper.address;
      const addressing = inputWrapper.input.addressing;
      const pubKey = witnessPubKeys[idx];
      try {
        return _validateAddressAndSignature(secret, pass, address, addressing, pubKey);
      } catch (e) {
        return { address, reason: 'Failed to perform validation!', error: stringifyError(e) };
      }
    }).filter(x => x);
    return { errors };
  } catch (e) {
    return {
      errors: [{ reason: 'Failed to perform validation!', error: stringifyError(e) }]
    };
  }
}

/**
 * Unpack and decode provided address and compare with the values calculated in Rust
 * @return an error descriptor object, or nothing if everything is ok
 */
function _validateAddressAndSignature(
  secret: Buffer,
  pass: Buffer,
  address: string,
  rustDerivationPath: AddressingSchemeV1,
  rustPubKey: string
): any {
  let unpackedAddress;
  try {
    unpackedAddress = unpackAddress(address, pass);
  } catch (e) {
    return { address, reason: 'Failed to unpack address', error: stringifyError(e) };
  }
  const { derivationPath } = unpackedAddress;
  if (!_.isEqual(derivationPath, rustDerivationPath)) {
    return { address, reason: 'Derivation path did not match', derivationPath, rustDerivationPath };
  }
  let pubKeyBuf;
  try {
    pubKeyBuf = derivationPath
      .reduce((pk, i) => derivePrivate(pk, i, 1), secret)
      .slice(64, 128);
  } catch (e) {
    return { address, reason: 'Failed to derive pub key!', error: stringifyError(e), derivationPath };
  }
  const pubKeyStr = pubKeyBuf.toString('hex');
  if (pubKeyStr !== rustPubKey) {
    return { address, reason: 'Pub key did not match', derivationPath, pubKeyStr, rustPubKey };
  }
  let decodedAddress;
  try {
    decodedAddress = decodeAddress(address);
  } catch (e) {
    return { address, reason: 'Failed to decode address', error: stringifyError(e) };
  }
  const { root, attr, type } = decodedAddress;
  let calculatedRoot: string;
  try {
    calculatedRoot = createAddressRoot(pubKeyBuf, type, attr).toString('hex');
  } catch (e) {
    const attrStr = attr.toString('hex');
    const reason = 'Failed to calculate root!';
    const error = stringifyError(e);
    return { address, reason, error, derivationPath, pubKeyStr, root, type, attrStr };
  }
  if (root !== calculatedRoot) {
    return { address, reason: 'Root does not match', derivationPath, pubKeyStr, root, calculatedRoot };
  }
  return undefined;
}

/** Follow heuristic to pick which address to send Daedalus transfer to */
async function _getReceiverAddress(): Promise<string> {
  // Note: Current heuristic is to pick the first address in the wallet
  // rationale & better heuristic described at https://github.com/Emurgo/yoroi-frontend/issues/96
  const addresses = await getAdaAddressesByType('External');
  return addresses[0].cadId;
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
