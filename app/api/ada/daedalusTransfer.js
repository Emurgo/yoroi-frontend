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
  GetAddressesWithFundsError,
  NoInputsError,
  GenerateTransferTxError
} from './errors';
import {
  sendAllUnsignedTxFromUtxo,
} from './adaTransactions/adaNewTransactions';
import {
  getAllUTXOsForAddresses
} from './lib/yoroi-backend-api';
import type {
  TransferTx
} from '../../types/TransferTypes';
import { getReceiverAddress } from './adaAddress';
import { RustModule } from './lib/cardanoCrypto/rustLoader';
import type {
  UTXO
} from './adaTypes';

import type { ConfigType } from '../../../config/config-types';

declare var CONFIG : ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

type AddressKeyMap = { [addr: string]: RustModule.Wallet.PrivateKey };

/** Go through the whole UTXO and see which belong to the walet and have non-empty balance
 * @param fullUtxo the full utxo of the Cardano blockchain
 */
export function getAddressesWithFunds(payload: {
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
    Logger.error(`daedalusTransfer::getAddressesWithFunds ${stringifyError(error)}`);
    throw new GetAddressesWithFundsError();
  }
}

/** Generate transaction including all addresses with no change */
export async function generateTransferTx(payload: {
  addressesWithFunds: AddressKeyMap
}): Promise<TransferTx> {
  const { addressesWithFunds } = payload;

  // fetch data to make transaction
  const senders = Object.keys(addressesWithFunds);
  const senderUtxos = await getAllUTXOsForAddresses(senders);
  if (_.isEmpty(senderUtxos)) {
    const error = new NoInputsError();
    Logger.error(`daedalusTransfer::generateTransferTx ${stringifyError(error)}`);
    throw error;
  }

  const outputAddr = await getReceiverAddress();

  return buildTransferTx({
    addressesWithFunds,
    senderUtxos,
    outputAddr,
  });
}

/** Generate transaction including all addresses with no change */
export async function buildTransferTx(payload: {
  addressesWithFunds: AddressKeyMap,
  senderUtxos: Array<UTXO>,
  outputAddr: string,
}): Promise<TransferTx> {
  try {
    const { addressesWithFunds, senderUtxos, outputAddr } = payload;

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
        addressesWithFunds[senderUtxos[i].receiver],
        txFinalizer.id()
      );
      txFinalizer.add_witness(witness);
    }

    const signedTx = txFinalizer.finalize();

    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(LOVELACES_PER_ADA),
      fee: fee.dividedBy(LOVELACES_PER_ADA),
      signedTx,
      senders: Object.keys(addressesWithFunds),
      receiver: outputAddr,
    };
  } catch (error) {
    Logger.error(`daedalusTransfer::generateTransferTx ${stringifyError(error)}`);
    throw new GenerateTransferTxError();
  }
}
