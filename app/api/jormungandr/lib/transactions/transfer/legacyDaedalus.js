// @flow

import { isEmpty } from 'lodash';
import type {
  AddressUtxoFunc,
  AddressUtxoResponse,
} from '../../state-fetch/types';
import type {
  TransferTx
} from '../../../../../types/TransferTypes';
import type { AddressKeyMap } from '../../../../ada/transactions/types';
import { buildDaedalusTransferTx } from '../daedalusTransfer';
import type { NetworkRow, JormungandrFeeConfig } from '../../../../ada/lib/storage/database/primitives/tables';
import {
  NoInputsError,
} from '../../../../common/errors';
import {
  Logger,
  stringifyError,
} from '../../../../../utils/logging';

export async function toSenderUtxos(payload: {|
  addressKeys: AddressKeyMap,
  network: $ReadOnly<NetworkRow>,
  getUTXOsForAddresses: AddressUtxoFunc,
|}): Promise<AddressUtxoResponse> {
  const senderUtxos = await payload.getUTXOsForAddresses({
    network: payload.network,
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
  network: $ReadOnly<NetworkRow>,
  getUTXOsForAddresses: AddressUtxoFunc,
  protocolParams: {|
    genesisHash: string,
    feeConfig: JormungandrFeeConfig,
    networkId: number,
  |},
|}): Promise<TransferTx> {
  const senderUtxos = await toSenderUtxos({
    network: payload.network,
    addressKeys: payload.addressKeys,
    getUTXOsForAddresses: payload.getUTXOsForAddresses,
  });
  return buildDaedalusTransferTx({
    outputAddr: payload.outputAddr,
    addressKeys: payload.addressKeys,
    senderUtxos,
    protocolParams: payload.protocolParams,
  });
}
