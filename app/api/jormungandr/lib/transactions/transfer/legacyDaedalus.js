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

export async function daedalusTransferTxFromAddresses(payload: {|
  addressKeys: AddressKeyMap,
  outputAddr: string,
  getUTXOsForAddresses: AddressUtxoFunc,
|}): Promise<TransferTx> {
  const senderUtxos = await toSenderUtxos({
    addressKeys: payload.addressKeys,
    getUTXOsForAddresses: payload.getUTXOsForAddresses,
  });
  return buildDaedalusTransferTx({
    outputAddr: payload.outputAddr,
    addressKeys: payload.addressKeys,
    senderUtxos,
  });
}
