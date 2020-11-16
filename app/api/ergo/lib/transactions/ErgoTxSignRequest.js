// @flow

import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import { getErgoCurrencyMeta } from '../../currencyInfo';
import type {
  Address, Value, Addressing,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import type { ErgoAddressedUtxo } from './types';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

type NetworkSettingSnapshot = {|
  // there is no way given just an unsigned transaction body to know which network it belongs to
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

  totalInput(shift: boolean): BigNumber {
    return getTxInputTotal(this.unsignedTx, this.changeAddr, shift);
  }

  totalOutput(shift: boolean): BigNumber {
    return getTxOutputTotal(
      this.unsignedTx,
      shift,
      this.networkSettingSnapshot.ChainNetworkId,
      this.networkSettingSnapshot.FeeAddress
    );
  }

  fee(shift: boolean): BigNumber {
    return getErgoTxFee(
      this.unsignedTx,
      shift,
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
        RustModule.SigmaRust.Address.new_p2pk(
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
  shift: boolean
): BigNumber {
  let sum = new BigNumber(0);

  const inputs = tx.box_selection().boxes();
  for (let i = 0; i < inputs.len(); i++) {
    const input = inputs.get(i);
    const value = new BigNumber(input.value().as_i64().to_str());
    sum = sum.plus(value);
  }

  const change = changeAddr
    .map(val => new BigNumber(val.value || new BigNumber(0)))
    .reduce((changeSum, val) => changeSum.plus(val), new BigNumber(0));

  sum = sum.minus(change);
  if (shift) {
    return sum.shiftedBy(-getErgoCurrencyMeta().decimalPlaces.toNumber());
  }
  return sum;
}

export function getTxOutputTotal(
  tx: RustModule.SigmaRust.TxBuilder,
  shift: boolean,
  networkId: $Values<typeof RustModule.SigmaRust.NetworkPrefix>,
  feeAddress: string,
): BigNumber {
  let sum = new BigNumber(0);

  const outputs = tx.build().outputs();
  for (let i = 0; i < outputs.len(); i++) {
    const output = outputs.get(i);
    const address = RustModule.SigmaRust.NetworkAddress.new(
      networkId,
      RustModule.SigmaRust.Address.new_p2pk(
        output.ergo_tree()
      )
    );
    const addr = Buffer.from(address.to_bytes()).toString('hex');
    if (addr === feeAddress) {
      continue;
    }
    const value = new BigNumber(output.value().as_i64().to_str());
    sum = sum.plus(value);
  }
  if (shift) {
    return sum.shiftedBy(-getErgoCurrencyMeta().decimalPlaces.toNumber());
  }
  return sum;
}

export function getErgoTxFee(
  tx: RustModule.SigmaRust.TxBuilder,
  shift: boolean,
): BigNumber {
  const result = new BigNumber(tx.fee_amount().as_i64().to_str());
  if (shift) {
    return result.shiftedBy(-getErgoCurrencyMeta().decimalPlaces.toNumber());
  }
  return result;
}

export function ergoTxEqual(
  req1: RustModule.SigmaRust.TxBuilder,
  req2: RustModule.SigmaRust.TxBuilder,
): boolean {
  const tx1 = req1.build().to_json();
  const tx2 = req2.build().to_json();
  return JSON.stringify(tx1) === JSON.stringify(tx2);
}
