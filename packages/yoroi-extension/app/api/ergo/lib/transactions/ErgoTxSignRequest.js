// @flow

import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import type {
  Address, Value, Addressing,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import {
  MultiToken,
} from '../../../common/lib/MultiToken';
import type { ErgoAddressedUtxo } from './types';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import { PRIMARY_ASSET_CONSTANTS } from '../../../ada/lib/storage/database/primitives/enums';

type NetworkSettingSnapshot = {|
  // there is no way given just an unsigned transaction body to know which network it belongs to
  +NetworkId: number,
  +ChainNetworkId: $Values<typeof RustModule.SigmaRust.NetworkPrefix>,
  +FeeAddress: string,
|};

export class ErgoTxSignRequest implements ISignRequest<RustModule.SigmaRust.TxBuilder> {

  senderUtxos: Array<ErgoAddressedUtxo>;
  unsignedTx: RustModule.SigmaRust.TxBuilder;
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>;
  networkSettingSnapshot: NetworkSettingSnapshot;

  constructor(signRequest: {|
    senderUtxos: Array<ErgoAddressedUtxo>,
    unsignedTx: RustModule.SigmaRust.TxBuilder,
    changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
    networkSettingSnapshot: NetworkSettingSnapshot,
  |}) {
    this.senderUtxos = signRequest.senderUtxos;
    this.unsignedTx = signRequest.unsignedTx;
    this.changeAddr = signRequest.changeAddr;
    this.networkSettingSnapshot = signRequest.networkSettingSnapshot;
  }

  totalInput(): MultiToken {
    return getTxInputTotal(
      this.unsignedTx,
      this.changeAddr,
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
      this.networkSettingSnapshot.NetworkId
    );
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(new Set(this.senderUtxos.map(utxo => utxo.receiver)));
  }

  receivers(includeChangeAndFee: boolean): Array<string> {
    const receivers: Array<string> = [];

    const changeAddrs = new Set(this.changeAddr.map(change => change.address));
    const outputs = this.unsignedTx.build().outputs();
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

  isEqual(tx: ?(mixed| RustModule.SigmaRust.TxBuilder)): boolean {
    if (tx == null) return false;
    if (!(tx instanceof RustModule.SigmaRust.TxBuilder)) {
      return false;
    }
    return ergoTxEqual(this.unsignedTx, tx);
  }

  self(): RustModule.SigmaRust.TxBuilder {
    return this.unsignedTx;
  }
}

export function getTxInputTotal(
  tx: RustModule.SigmaRust.TxBuilder,
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

  const inputs = tx.box_selection().boxes();
  for (let i = 0; i < inputs.len(); i++) {
    const input = inputs.get(i);
    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
      amount: new BigNumber(input.value().as_i64().to_str()),
      networkId,
    });
    const tokens = input.tokens();
    for (let j = 0; j < tokens.len(); j++) {
      const token = tokens.get(j);
      values.add({
        identifier: token.id().to_str(),
        amount: new BigNumber(token.amount().as_i64().to_str()),
        networkId,
      });
    }
  }

  changeAddr.forEach(change => values.joinSubtractMutable(change.values));

  return values;
}

export function getTxOutputTotal(
  tx: RustModule.SigmaRust.TxBuilder,
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

  const outputs = tx.build().outputs();
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
  tx: RustModule.SigmaRust.TxBuilder,
  networkId: number,
): MultiToken {
  const values = new MultiToken(
    [{
      identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
      amount: new BigNumber(tx.fee_amount().as_i64().to_str()),
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
  req1: RustModule.SigmaRust.TxBuilder,
  req2: RustModule.SigmaRust.TxBuilder,
): boolean {
  const tx1 = req1.build().to_json();
  const tx2 = req2.build().to_json();
  return JSON.stringify(tx1) === JSON.stringify(tx2);
}
