// @flow

// Handle data created by wallets using the v1 address scheme

import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { coinToBigNumber } from './lib/utils';
import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import { LOVELACES_PER_ADA } from '../../config/numbersConfig';
import {
  GetAddressesKeysError,
  NoInputsError,
  GenerateTransferTxError
} from './errors';
import {
  sendAllUnsignedTxFromUtxo,
} from './adaTransactions/transactionsV2';
import type {
  AddressUtxoFunc
} from './lib/state-fetch/types';
import type {
  TransferTx
} from '../../types/TransferTypes';
import { RustModule } from './lib/cardanoCrypto/rustLoader';
import type {
  RemoteUnspentOutput
} from './adaTypes';

import type { ConfigType } from '../../../config/config-types';

declare var CONFIG : ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

type AddressKeyMap = { [addr: string]: RustModule.Wallet.PrivateKey };

/** Go through the whole UTXO and find the addresses that belong to the user along with the keys
 * @param fullUtxo the full utxo of the Cardano blockchain
 */
export function getAddressesKeys(payload: {
  checker: RustModule.Wallet.DaedalusAddressChecker,
  fullUtxo: Array<string>
}): AddressKeyMap {
  try {
    const { checker, fullUtxo } = payload;

    const addrKeyMap = {};
    for (const addr of fullUtxo) {
      const rustAddr = RustModule.Wallet.Address.from_base58(addr);
      const checkedAddr = checker.check_address(rustAddr);
      if (checkedAddr.is_checked()) {
        addrKeyMap[addr] = checkedAddr.private_key();
      }
    }
    return addrKeyMap;
  } catch (error) {
    Logger.error(`daedalusTransfer::getAddressesKeys ${stringifyError(error)}`);
    throw new GetAddressesKeysError();
  }
}

/**
 Generate transaction including all addresses with no change.
 If filterSenders is true, only include addresses that have outstanding
 UTXOs in the senders property.
*/
export async function generateTransferTx(
  payload: {
    outputAddr: string,
    addressKeys: AddressKeyMap,
    getUTXOsForAddresses: AddressUtxoFunc,
    filterSenders?: boolean
  }
): Promise<TransferTx> {
  const { outputAddr, addressKeys, getUTXOsForAddresses, filterSenders = false } = payload;

  // fetch data to make transaction
  const senders = Object.keys(addressKeys);
  const senderUtxos = await getUTXOsForAddresses({ addresses: senders });

  if (_.isEmpty(senderUtxos)) {
    const error = new NoInputsError();
    Logger.error(`daedalusTransfer::generateTransferTx ${stringifyError(error)}`);
    throw error;
  }

  return buildTransferTx({
    addressKeys,
    senderUtxos,
    outputAddr,
    filterSenders,
  });
}

/**
  Generate transaction including all addresses with no change.
  If filterSenders is true, only include addresses that have outstanding
  UTXOs in the senders property.
*/
export async function buildTransferTx(
  payload: {
    addressKeys: AddressKeyMap,
    senderUtxos: Array<RemoteUnspentOutput>,
    outputAddr: string,
    filterSenders?: boolean
  }
): Promise<TransferTx> {
  try {
    const { addressKeys, senderUtxos, outputAddr, filterSenders = false } = payload;

    const totalBalance = senderUtxos
      .map(utxo => new BigNumber(utxo.amount))
      .reduce(
        (acc, amount) => acc.plus(amount),
        new BigNumber(0)
      );

    // first build a transaction to see what the fee will be
    const txBuilder = await sendAllUnsignedTxFromUtxo(
      outputAddr,
      senderUtxos
    ).then(resp => resp.txBuilder);
    const fee = coinToBigNumber(txBuilder.get_balance_without_fees().value());

    // sign inputs
    const txFinalizer = new RustModule.Wallet.TransactionFinalized(
      txBuilder.make_transaction()
    );
    const setting = RustModule.Wallet.BlockchainSettings.from_json({
      protocol_magic: protocolMagic
    });
    for (let i = 0; i < senderUtxos.length; i++) {
      const witness = RustModule.Wallet.Witness.new_extended_key(
        setting,
        addressKeys[senderUtxos[i].receiver],
        txFinalizer.id()
      );
      txFinalizer.add_witness(witness);
    }

    const signedTx = txFinalizer.finalize();

    let senders = Object.keys(addressKeys);

    if (filterSenders) {
      senders = senders.filter(addr => senderUtxos.some(({ receiver }) => receiver === addr));
    }
    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(LOVELACES_PER_ADA),
      fee: fee.dividedBy(LOVELACES_PER_ADA),
      signedTx,
      senders,
      receiver: outputAddr,
    };
  } catch (error) {
    Logger.error(`daedalusTransfer::buildTransferTx ${stringifyError(error)}`);
    throw new GenerateTransferTxError();
  }
}
