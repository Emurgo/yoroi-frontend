// @flow

import { isEmpty } from 'lodash';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import {
  GetAddressesKeysError,
  NoInputsError,
} from '../../../common/errors';
import type {
  AddressUtxoFunc,
  AddressUtxoResponse,
} from '../../lib/state-fetch/types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import type { AddressKeyMap } from '../types';
import { buildDaedalusTransferTx } from '../byron/daedalusTransfer';

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

    const addrKeyMap: { [addr: string]: RustModule.WalletV2.PrivateKey, ... } = {};
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
    Logger.error(`legacyDaedalus::${nameof(getAddressesKeys)} ${stringifyError(error)}`);
    throw new GetAddressesKeysError();
  }
}

export async function toSenderUtxos(payload: {|
  addressKeys: AddressKeyMap,
  getUTXOsForAddresses: AddressUtxoFunc,
|}): Promise<AddressUtxoResponse> {
  const senderUtxos = await payload.getUTXOsForAddresses({
    addresses: Object.keys(payload.addressKeys)
  });

  if (isEmpty(senderUtxos)) {
    const error = new NoInputsError();
    Logger.error(`legacyDaedalus::${nameof(toSenderUtxos)} ${stringifyError(error)}`);
    throw error;
  }

  return senderUtxos;
}

export async function daedalusTransferTxFromAddresses(payload: {|
  addressKeys: AddressKeyMap,
  outputAddr: string,
  getUTXOsForAddresses: AddressUtxoFunc,
  byronNetworkMagic: number,
|}): Promise<TransferTx> {
  const senderUtxos = await toSenderUtxos({
    addressKeys: payload.addressKeys,
    getUTXOsForAddresses: payload.getUTXOsForAddresses,
  });
  return buildDaedalusTransferTx({
    outputAddr: payload.outputAddr,
    addressKeys: payload.addressKeys,
    senderUtxos,
    byronNetworkMagic: payload.byronNetworkMagic,
  });
}
