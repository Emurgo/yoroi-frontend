// @flow

import { isEmpty } from 'lodash';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import {
  GetAddressesKeysError,
  NoInputsError,
} from '../../errors';
import type {
  AddressUtxoFunc,
  AddressUtxoResponse,
} from '../../lib/state-fetch/types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import type { AddressKeyMap } from '../types';
import { buildDaedalusTransferTx as shelleyFormatDaedalusTx } from '../shelley/daedalusTransfer';
import { buildDaedalusTransferTx as legacyFormatDaedalusTx } from '../byron/daedalusTransfer';

/**
 * Go through the whole UTXO and find the addresses that belong to the user along with the keys
 * @param fullUtxo the full utxo of the Cardano blockchain
 */
export function getAddressesKeys(payload: {|
  checker: RustModule.WalletV2.DaedalusAddressChecker,
  fullUtxo: Array<string>
|}): AddressKeyMap {
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
    Logger.error(`legacyDaedalus::getAddressesKeys ${stringifyError(error)}`);
    throw new GetAddressesKeysError();
  }
}

async function toSenderUtxos(payload: {|
  outputAddr: string,
  addressKeys: AddressKeyMap,
  getUTXOsForAddresses: AddressUtxoFunc,
|}): Promise<AddressUtxoResponse> {
  const senderUtxos = await payload.getUTXOsForAddresses({
    addresses: Object.keys(payload.addressKeys)
  });

  if (isEmpty(senderUtxos)) {
    const error = new NoInputsError();
    Logger.error(`legacyDaedalus::generateTransferTx ${stringifyError(error)}`);
    throw error;
  }

  return senderUtxos;
}

export async function buildDaedalusTransferTx(payload: {|
  addressKeys: AddressKeyMap,
  outputAddr: string,
  getUTXOsForAddresses: AddressUtxoFunc,
  legacy: boolean,
|}): Promise<TransferTx> {
  const senderUtxos = await toSenderUtxos({
    outputAddr: payload.outputAddr,
    addressKeys: payload.addressKeys,
    getUTXOsForAddresses: payload.getUTXOsForAddresses,
  });

  const txRequest = {
    outputAddr: payload.outputAddr,
    addressKeys: payload.addressKeys,
    senderUtxos,
  };
  return payload.legacy
    ? legacyFormatDaedalusTx(txRequest)
    : shelleyFormatDaedalusTx(txRequest);
}
