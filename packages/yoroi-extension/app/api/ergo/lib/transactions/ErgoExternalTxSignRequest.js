// @flow

import type {
  Address, Value, Addressing,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import type { ErgoAddressedUtxo } from './types';
import type { RemoteUnspentOutput } from '../state-fetch/types';
import type { TxDataOutput, TxDataInput } from '../../../common/types';
import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import {
  MultiToken,
} from '../../../common/lib/MultiToken';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import { PRIMARY_ASSET_CONSTANTS } from '../../../ada/lib/storage/database/primitives/enums';

type NetworkSettingSnapshot = {|
  // there is no way given just an unsigned transaction body to know which network it belongs to
  +NetworkId: number,
  +ChainNetworkId: $Values<typeof RustModule.SigmaRust.NetworkPrefix>,
  +FeeAddress: string,
|};

export class ErgoExternalTxSignRequest
  implements ISignRequest<RustModule.SigmaRust.UnsignedTransaction>
{

  inputUtxos: $ReadOnlyArray<ErgoAddressedUtxo | RemoteUnspentOutput>;
  unsignedTx: RustModule.SigmaRust.UnsignedTransaction;
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>;
  networkSettingSnapshot: NetworkSettingSnapshot;

  constructor(signRequest: {|
    inputUtxos: $ReadOnlyArray<ErgoAddressedUtxo | RemoteUnspentOutput>,
    unsignedTx: RustModule.SigmaRust.UnsignedTransaction,
    changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
    networkSettingSnapshot: NetworkSettingSnapshot,
  |}) {
    this.inputUtxos = signRequest.inputUtxos;
    this.unsignedTx = signRequest.unsignedTx;
    this.changeAddr = signRequest.changeAddr;
    this.networkSettingSnapshot = signRequest.networkSettingSnapshot;
  }

  inputs(): Array<TxDataInput> {
    return getTxInputs(
      this.inputUtxos,
      this.changeAddr,
      this.networkSettingSnapshot.NetworkId
    );
  }
  totalInput(): MultiToken {
    return getTxInputTotal(
      this.inputUtxos,
      this.changeAddr,
      this.networkSettingSnapshot.NetworkId
    );
  }

  outputs(): Array<TxDataOutput> {
    return getTxOutputs(
      this.unsignedTx,
      this.networkSettingSnapshot.ChainNetworkId,
      this.networkSettingSnapshot.FeeAddress,
      this.networkSettingSnapshot.NetworkId
    );
  }
  totalOutput(): MultiToken {
    return getTxOutputTotal(
      this.unsignedTx,
      this.networkSettingSnapshot.ChainNetworkId,
      this.networkSettingSnapshot.FeeAddress,
      this.networkSettingSnapshot.NetworkId
    );
  }

  fee(): MultiToken {
    return getErgoTxFee(
      this.unsignedTx,
      this.networkSettingSnapshot.NetworkId,
      this.networkSettingSnapshot.ChainNetworkId,
      this.networkSettingSnapshot.FeeAddress,
    );
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(new Set(this.inputUtxos.map(utxo => utxo.receiver)));
  }

  receivers(includeChangeAndFee: boolean): Array<string> {
    const receivers: Array<string> = [];

    const changeAddrs = new Set(this.changeAddr.map(change => change.address));
    const outputs = this.unsignedTx.output_candidates();
    for (let i = 0; i < outputs.len(); i++) {
      const output = outputs.get(i);
      const ergoTree = output.ergo_tree();
      const address = RustModule.SigmaRust.NetworkAddress.new(
        this.networkSettingSnapshot.ChainNetworkId,
        RustModule.SigmaRust.Address.recreate_from_ergo_tree(
          ergoTree
        )
      );
      const addr = Buffer.from(address.to_bytes()).toString('hex');
      if (!includeChangeAndFee) {
        if (changeAddrs.has(addr)) {
          continue;
        }
      }
      if (!includeChangeAndFee) {
        if (addr === this.networkSettingSnapshot.FeeAddress) {
          continue;
        }
      }
      receivers.push(addr);
    }
    return receivers;
  }

  isEqual(tx: ?(mixed| RustModule.SigmaRust.UnsignedTransaction)): boolean {
    if (tx == null) return false;
    if (!(tx instanceof RustModule.SigmaRust.UnsignedTransaction)) {
      return false;
    }
    return ergoTxEqual(this.unsignedTx, tx);
  }

  self(): RustModule.SigmaRust.UnsignedTransaction {
    return this.unsignedTx;
  }
}

export function getTxInputs(
  inputUtxos: $ReadOnlyArray<ErgoAddressedUtxo | RemoteUnspentOutput>,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
  networkId: number,
): Array<{|
    address: string,
    value: MultiToken,
  |}> {
  const values = [];

  for (const input of inputUtxos) {
    const value = new MultiToken(
      [{
        identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
        amount: new BigNumber(input.amount),
        networkId,
      }],
      {
        defaultNetworkId: networkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Ergo,
      }
    );
    for (const asset of (input.assets ?? [])) {
      value.add({
        identifier: asset.tokenId,
        amount: new BigNumber(asset.amount),
        networkId,
      });
    }
    values.push({
      address: input.receiver,
      value,
    });
  }

  return values;
}
export function getTxInputTotal(
  inputUtxos: $ReadOnlyArray<ErgoAddressedUtxo | RemoteUnspentOutput>,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
  networkId: number,
): MultiToken {
  const values = new MultiToken(
    [],
    {
      defaultNetworkId: networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Ergo,
    }
  );

  for (const input of inputUtxos) {
    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
      amount: new BigNumber(input.amount),
      networkId,
    });
    for (const asset of (input.assets ?? [])) {
      values.add({
        identifier: asset.tokenId,
        amount: new BigNumber(asset.amount),
        networkId,
      });
    }
  }

  changeAddr.forEach(change => values.joinSubtractMutable(change.values));

  return values;
}

export function getTxOutputs(
  tx: RustModule.SigmaRust.UnsignedTransaction,
  chainNetworkId: $Values<typeof RustModule.SigmaRust.NetworkPrefix>,
  feeAddress: string,
  networkId: number,
): Array<TxDataOutput> {
  const values = [];

  const outputs = tx.output_candidates();
  for (let i = 0; i < outputs.len(); i++) {
    const output = outputs.get(i);
    const address = RustModule.SigmaRust.NetworkAddress.new(
      chainNetworkId,
      RustModule.SigmaRust.Address.recreate_from_ergo_tree(
        output.ergo_tree()
      )
    );
    const addr = Buffer.from(address.to_bytes()).toString('hex');
    if (addr === feeAddress) {
      continue;
    }
    const value = new MultiToken(
      [{
        identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
        amount: new BigNumber(output.value().as_i64().to_str()),
        networkId,
      }],
      {
        defaultNetworkId: networkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Ergo,
      }
    );

    const tokens = output.tokens();
    for (let j = 0; j < tokens.len(); j++) {
      const token = tokens.get(j);
      value.add({
        identifier: token.id().to_str(),
        amount: new BigNumber(token.amount().as_i64().to_str()),
        networkId,
      });
    }
    values.push({
      value,
      isForeign: false,
      address: addr,
    });
  }

  return values;
}
export function getTxOutputTotal(
  tx: RustModule.SigmaRust.UnsignedTransaction,
  chainNetworkId: $Values<typeof RustModule.SigmaRust.NetworkPrefix>,
  feeAddress: string,
  networkId: number,
): MultiToken {
  const values = new MultiToken(
    [],
    {
      defaultNetworkId: networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Ergo,
    }
  );

  const outputs = tx.output_candidates();
  for (let i = 0; i < outputs.len(); i++) {
    const output = outputs.get(i);
    const address = RustModule.SigmaRust.NetworkAddress.new(
      chainNetworkId,
      RustModule.SigmaRust.Address.recreate_from_ergo_tree(
        output.ergo_tree()
      )
    );
    const addr = Buffer.from(address.to_bytes()).toString('hex');
    if (addr === feeAddress) {
      continue;
    }
    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
      amount: new BigNumber(output.value().as_i64().to_str()),
      networkId,
    });

    const tokens = output.tokens();
    for (let j = 0; j < tokens.len(); j++) {
      const token = tokens.get(j);
      values.add({
        identifier: token.id().to_str(),
        amount: new BigNumber(token.amount().as_i64().to_str()),
        networkId,
      });
    }
  }

  return values;
}

export function getErgoTxFee(
  tx: RustModule.SigmaRust.UnsignedTransaction,
  networkId: number,
  chainNetworkId: $Values<typeof RustModule.SigmaRust.NetworkPrefix>,
  feeAddress: string,
): MultiToken {
  const feeAmount = (() => {
    const outputs = tx.output_candidates();
    for (let i = 0; i < outputs.len(); i++) {
      const output = outputs.get(i);
      const address = RustModule.SigmaRust.NetworkAddress.new(
        chainNetworkId,
        RustModule.SigmaRust.Address.recreate_from_ergo_tree(
          output.ergo_tree()
        )
      );
      const addr = Buffer.from(address.to_bytes()).toString('hex');
      if (addr === feeAddress) {
        return output.value().as_i64().to_str();
      }
    }
  })();
  const values = new MultiToken(
    feeAmount == null
      ? []
      : [{
        identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
        amount: new BigNumber(feeAmount),
        networkId,
      }],
    {
      defaultNetworkId: networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Ergo,
    }
  );

  return values;
}

export function ergoTxEqual(
  req1: RustModule.SigmaRust.UnsignedTransaction,
  req2: RustModule.SigmaRust.UnsignedTransaction,
): boolean {
  return req1.to_json() === req2.to_json();
}
