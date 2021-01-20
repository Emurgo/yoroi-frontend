// @flow

import type {
  AddressUtxoFunc,
} from '../../state-fetch/types';
import type {
  TransferTx
} from '../../../../../types/TransferTypes';
import type { AddressKeyMap } from '../../../../ada/transactions/types';
import { buildDaedalusTransferTx } from '../daedalusTransfer';
import { toSenderUtxos } from '../../../../ada/transactions/transfer/legacyDaedalus';
import type { NetworkRow, JormungandrFeeConfig } from '../../../../ada/lib/storage/database/primitives/tables';

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
