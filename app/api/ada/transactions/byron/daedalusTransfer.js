// @flow

// Handle data created by wallets using the v1 address scheme

import { isEmpty } from 'lodash';
import BigNumber from 'bignumber.js';
import { coinToBigNumber, } from '../utils';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import { LOVELACES_PER_ADA } from '../../../../config/numbersConfig';
import {
  GetAddressesKeysError,
  NoInputsError,
  GenerateTransferTxError
} from '../../errors';
import {
  sendAllUnsignedTxFromUtxo,
} from './transactionsV2';
import type {
  AddressUtxoFunc,
  RemoteUnspentOutput
} from '../../lib/state-fetch/types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import type { ConfigType } from '../../../../../config/config-types';

declare var CONFIG : ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

type AddressKeyMap = { [addr: string]: RustModule.WalletV2.PrivateKey };

/**
 * Go through the whole UTXO and find the addresses that belong to the user along with the keys
 * @param fullUtxo the full utxo of the Cardano blockchain
 */
export function getAddressesKeys(payload: {
  checker: RustModule.WalletV2.DaedalusAddressChecker,
  fullUtxo: Array<string>
}): AddressKeyMap {
  try {
    const { checker, fullUtxo } = payload;

    const addrKeyMap: { [addr: string]: RustModule.WalletV2.PrivateKey } = {};
    for (const addr of fullUtxo) {
      const rustAddr = RustModule.WalletV2.Address.from_base58(addr);
      const checkedAddr = checker.check_address(rustAddr);
      if (checkedAddr.is_checked()) {
        const v2Key = checkedAddr.private_key();
        addrKeyMap[addr] = v2Key;
      }
    }
    return addrKeyMap;
  } catch (error) {
    Logger.error(`daedalusTransfer::getAddressesKeys ${stringifyError(error)}`);
    throw new GetAddressesKeysError();
  }
}

/**
 * Generate transaction including all addresses with no change.
*/
export async function generateDaedalusTransferTx(
  payload: {
    outputAddr: string,
    addressKeys: AddressKeyMap,
    getUTXOsForAddresses: AddressUtxoFunc,
  }
): Promise<TransferTx> {
  const { outputAddr, addressKeys, getUTXOsForAddresses } = payload;

  // fetch data to make transaction
  const senders = Object.keys(addressKeys);
  const senderUtxos = await getUTXOsForAddresses({ addresses: senders });

  if (isEmpty(senderUtxos)) {
    const error = new NoInputsError();
    Logger.error(`daedalusTransfer::generateTransferTx ${stringifyError(error)}`);
    throw error;
  }

  return buildDaedalusTransferTx({
    addressKeys,
    senderUtxos,
    outputAddr,
  });
}

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildDaedalusTransferTx(
  payload: {
    addressKeys: AddressKeyMap,
    senderUtxos: Array<RemoteUnspentOutput>,
    outputAddr: string,
  }
): Promise<TransferTx> {
  try {
    const { addressKeys, senderUtxos, outputAddr } = payload;

    const totalBalance = senderUtxos
      .map(utxo => new BigNumber(utxo.amount))
      .reduce(
        (acc, amount) => acc.plus(amount),
        new BigNumber(0)
      );

    // build tx
    const txBuilder = sendAllUnsignedTxFromUtxo(
      outputAddr,
      senderUtxos
    ).txBuilder;
    const fee = coinToBigNumber(txBuilder.get_balance_without_fees().value());

    // sign
    const signedTx = signDaedalusTransaction(
      txBuilder.make_transaction(),
      addressKeys,
      senderUtxos,
    );

    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(LOVELACES_PER_ADA),
      fee: fee.dividedBy(LOVELACES_PER_ADA),
      signedTx,
      senders: Object.keys(addressKeys),
      receiver: outputAddr,
    };
  } catch (error) {
    Logger.error(`daedalusTransfer::buildTransferTx ${stringifyError(error)}`);
    throw new GenerateTransferTxError();
  }
}

export function signDaedalusTransaction(
  unsignedTx: RustModule.WalletV2.Transaction,
  addressKeys: AddressKeyMap,
  senderUtxos: Array<RemoteUnspentOutput>,
): RustModule.WalletV2.SignedTransaction {
  const txFinalizer = new RustModule.WalletV2.TransactionFinalized(unsignedTx);

  const setting = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
  });
  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = RustModule.WalletV2.Witness.new_extended_key(
      setting,
      addressKeys[senderUtxos[i].receiver],
      txFinalizer.id()
    );
    txFinalizer.add_witness(witness);
  }

  const signedTx = txFinalizer.finalize();
  return signedTx;
}
