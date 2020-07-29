// @flow

import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import type { BaseSignRequest } from '../types';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { getAdaCurrencyMeta } from '../../currencyInfo';

export class ByronTxSignRequest implements ISignRequest<RustModule.WalletV2.Transaction> {

  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>;

  constructor(signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>) {
    this.signRequest = signRequest;
  }

  totalInput(shift: boolean): BigNumber {
    const inputTotal = this.signRequest.senderUtxos
      .map(utxo => new BigNumber(utxo.amount))
      .reduce((sum, val) => sum.plus(val), new BigNumber(0));

    const change = this.signRequest.changeAddr
      .map(val => new BigNumber(val.value || new BigNumber(0)))
      .reduce((sum, val) => sum.plus(val), new BigNumber(0));

    let result = inputTotal.minus(change);
    if (shift) {
      result = result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
    }
    return result;
  }

  totalOutput(shift: boolean): BigNumber {
    let result = this.signRequest.unsignedTx
      .to_json()
      .outputs
      .map(output => new BigNumber(output.value))
      .reduce((sum, val) => sum.plus(val), new BigNumber(0));

    if (shift) {
      result = result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
    }
    return result;
  }

  fee(shift: boolean): BigNumber {
    const inputTotal = this.signRequest.senderUtxos
      .map(utxo => new BigNumber(utxo.amount))
      .reduce((sum, val) => sum.plus(val), new BigNumber(0));

    const tx = this.signRequest.unsignedTx.to_json();
    const outputTotal = tx.outputs
      .map(val => new BigNumber(val.value))
      .reduce((sum, val) => sum.plus(val), new BigNumber(0));

    let result = inputTotal.minus(outputTotal);
    if (shift) {
      result = result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
    }
    return result;
  }

  receivers(includeChange: boolean): Array<string> {
    const tx = this.signRequest.unsignedTx.to_json();
    let receivers = tx.outputs
      .map(val => val.address);

    if (!includeChange) {
      const changeAddrs = this.signRequest.changeAddr.map(change => change.address);
      receivers = receivers.filter(addr => !changeAddrs.includes(addr));
    }
    return receivers;
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(new Set(this.signRequest.senderUtxos.map(utxo => utxo.receiver)));
  }

  copy(): ByronTxSignRequest {
    return new ByronTxSignRequest({
      changeAddr: this.signRequest.changeAddr,
      senderUtxos: this.signRequest.senderUtxos,
      unsignedTx: this.signRequest.unsignedTx.clone(),
      certificate: undefined,
    });
  }

  isEqual(tx: ?(mixed| RustModule.WalletV2.Transaction)): boolean {
    if (tx == null) return false;
    if (!(tx instanceof RustModule.WalletV2.Transaction)) {
      return false;
    }
    return byronTxEqual(
      this.signRequest.unsignedTx,
      tx
    );
  }

  self(): BaseSignRequest<RustModule.WalletV2.Transaction> {
    return this.signRequest;
  }
}

/**
 * Signing a tx is a destructive operation in Rust
 * We create a copy of the tx so the user can retry if they get the password wrong
 */
export function copySignRequest(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>
): BaseSignRequest<RustModule.WalletV2.Transaction> {
  return {
    changeAddr: signRequest.changeAddr,
    senderUtxos: signRequest.senderUtxos,
    unsignedTx: signRequest.unsignedTx.clone(),
    certificate: undefined,
  };
}

export function byronTxEqual(
  req1: RustModule.WalletV2.Transaction,
  req2: RustModule.WalletV2.Transaction,
): boolean {
  return JSON.stringify(req1.to_json()) === JSON.stringify(req2.to_json());
}
