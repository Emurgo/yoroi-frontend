// @flow

import BigNumber from 'bignumber.js';
import type {
  AddressUtxoFunc,
} from '../../lib/state-fetch/types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import type {
  Address, Addressing
} from '../../lib/storage/models/PublicDeriver/interfaces';
import { buildYoroiTransferTx as legacyFormatYoroiTx } from '../byron/yoroiTransfer';
import { toSenderUtxos } from './utils';
import type { NetworkRow } from '../../lib/storage/database/primitives/tables';

export async function yoroiTransferTxFromAddresses(payload: {|
  addresses: Array<{| ...Address, ...Addressing |}>,
  outputAddr: {|
    ...Address,
    ...InexactSubset<Addressing>,
  |},
  keyLevel: number,
  signingKey: RustModule.WalletV4.Bip32PrivateKey,
  getUTXOsForAddresses: AddressUtxoFunc,
  network: $ReadOnly<NetworkRow>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    keyDeposit: RustModule.WalletV4.BigNum,
    linearFee: RustModule.WalletV4.LinearFee,
    coinsPerUtxoByte: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
|}): Promise<TransferTx> {
  const senderUtxos = await toSenderUtxos({
    addresses: payload.addresses,
    network: payload.network,
    getUTXOsForAddresses: payload.getUTXOsForAddresses,
  });
  return legacyFormatYoroiTx({
    outputAddr: payload.outputAddr,
    keyLevel: payload.keyLevel,
    signingKey: payload.signingKey,
    senderUtxos,
    protocolParams: payload.protocolParams,
    absSlotNumber: payload.absSlotNumber,
    networkId: payload.network.NetworkId,
  });
}
