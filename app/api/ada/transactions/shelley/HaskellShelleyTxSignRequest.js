// @flow

import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import type { BaseSignRequest } from '../types';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { getAdaCurrencyMeta } from '../../currencyInfo';

export class HaskellShelleyTxSignRequest
implements ISignRequest<RustModule.WalletV4.TransactionBody> {

  signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBody>;
  poolDeposit: RustModule.WalletV4.BigNum;
  keyDeposit: RustModule.WalletV4.BigNum;

  constructor(
    signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBody>,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
  ) {
    this.signRequest = signRequest;
    this.poolDeposit = poolDeposit;
    this.keyDeposit = keyDeposit;
  }

  totalInput(shift: boolean): BigNumber {
    const inputTotal = this.signRequest.senderUtxos
      .map(utxo => new BigNumber(utxo.amount))
      .reduce((sum, val) => sum.plus(val), new BigNumber(0));

    const result = inputTotal.plus(
      RustModule.WalletV4.get_implicit_input(
        this.signRequest.unsignedTx,
        this.poolDeposit,
        this.keyDeposit
      ).to_str()
    );

    if (shift) {
      return result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
    }
    return result;
  }

  totalOutput(shift: boolean): BigNumber {
    let outputSum = new BigNumber(0);
    const outputs = this.signRequest.unsignedTx.outputs();
    for (let i = 0; i < outputs.len(); i++) {
      outputSum = outputSum.plus(outputs.get(i).amount().to_str());
    }

    if (shift) {
      return outputSum.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
    }
    return outputSum;
  }

  fee(shift: boolean): BigNumber {
    const fee = this.signRequest.unsignedTx.fee();
    const result = new BigNumber(fee.to_str());

    if (shift) {
      return result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
    }
    return result;
  }

  receivers(includeChange: boolean): Array<string> {
    const outputs = this.signRequest.unsignedTx.outputs();

    const outputStrings = [];
    for (let i = 0; i < outputs.len(); i++) {
      outputStrings.push(
        Buffer.from(outputs.get(i).address().to_bytes()).toString('hex')
      );
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
    if (!(tx instanceof RustModule.WalletV4.TransactionBody)) {
      return false;
    }
    return shelleyTxEqual(
      this.signRequest.unsignedTx,
      tx
    );
  }

  self(): BaseSignRequest<RustModule.WalletV4.TransactionBody> {
    return this.signRequest;
  }
}

export function shelleyTxEqual(
  req1: RustModule.WalletV4.TransactionBody,
  req2: RustModule.WalletV4.TransactionBody,
): boolean {
  return Buffer.from(req1.to_bytes()).toString('hex') === Buffer.from(req2.to_bytes()).toString('hex');
}
