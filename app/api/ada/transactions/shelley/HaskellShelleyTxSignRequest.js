// @flow

import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import type { BaseSignRequest } from '../types';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { getAdaCurrencyMeta } from '../../currencyInfo';
import { toHexOrBase58 } from '../../lib/storage/bridge/utils';

export class HaskellShelleyTxSignRequest
implements ISignRequest<RustModule.WalletV4.TransactionBuilder> {

  signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder>;

  constructor(signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder>) {
    this.signRequest = signRequest;
  }

  totalInput(shift: boolean): BigNumber {
    const inputTotal = this.signRequest.unsignedTx.get_implicit_input().checked_add(
      this.signRequest.unsignedTx.get_explicit_input()
    );

    const change = this.signRequest.changeAddr
      .map(val => new BigNumber(val.value || new BigNumber(0)))
      .reduce((sum, val) => sum.plus(val), new BigNumber(0));
    const result = new BigNumber(inputTotal.to_str()).minus(change);
    if (shift) {
      return result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
    }
    return result;
  }

  totalOutput(shift: boolean): BigNumber {
    const totalOutput = this.signRequest.unsignedTx.get_explicit_output();

    const result = new BigNumber(totalOutput.to_str());
    if (shift) {
      return result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
    }
    return result;
  }

  fee(shift: boolean): BigNumber {
    const fee = this.signRequest.unsignedTx.get_fee_or_calc();
    const result = new BigNumber(fee.to_str());

    if (shift) {
      return result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
    }
    return result;
  }

  receivers(includeChange: boolean): Array<string> {
    const outputs = this.signRequest.unsignedTx.build().outputs();

    const outputStrings = [];
    for (let i = 0; i < outputs.len(); i++) {
      outputStrings.push(toHexOrBase58(outputs.get(i).address()));
    }

    if (!includeChange) {
      const changeAddrs = this.signRequest.changeAddr.map(change => change.address);
      return outputStrings.filter(addr => !changeAddrs.includes(addr));
    }
    return outputStrings;
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(new Set(this.signRequest.senderUtxos.map(utxo => utxo.receiver)));
  }

  isEqual(tx: ?(mixed| RustModule.WalletV4.TransactionBuilder)): boolean {
    if (tx == null) return false;
    if (!(tx instanceof RustModule.WalletV4.TransactionBuilder)) {
      return false;
    }
    return shelleyTxEqual(
      this.signRequest.unsignedTx,
      tx
    );
  }

  self(): BaseSignRequest<RustModule.WalletV4.TransactionBuilder> {
    return this.signRequest;
  }
}

export function shelleyTxEqual(
  req1: RustModule.WalletV4.TransactionBuilder,
  req2: RustModule.WalletV4.TransactionBuilder,
): boolean {
  return Buffer.from(req1.build().to_bytes()).toString('hex') === Buffer.from(req2.build().to_bytes()).toString('hex');
}
