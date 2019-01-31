// @flow

import { Redemption } from 'rust-cardano-crypto';
import { SeedWithInvalidLengthError, CreateRedeemTransactionError } from './cryptoErrors';
import type { ConfigType } from '../../../../../config/config-types';
import type { UTXO } from '../../adaTypes';
import type { RedeemResponse } from '../../../../../flow/declarations/CardanoCrypto';
import { Logger } from '../../../../utils/logging';

declare var CONFIG : ConfigType;

const protocolMagic = CONFIG.network.protocolMagic;

export function getAddressFromRedemptionKey(
  redemptionKey: Buffer,
): Uint8Array {
  const address = Redemption.redemptionKeyToAddress(redemptionKey, protocolMagic);
  if (!address) {
    throw new SeedWithInvalidLengthError();
  }
  return address;
}

export function getRedemptionSignedTransaction(
  redemptionKey: Buffer,
  address: string,
  utxo: UTXO
): RedeemResponse {
  const utxoIdBuffer = Buffer.from(utxo.tx_hash, 'hex');
  const input = { id: utxoIdBuffer, index: utxo.tx_index };
  const output = { address, value: JSON.stringify(parseInt(utxo.amount, 10)) };
  const redeemResponse = Redemption.createRedemptionTransaction(
    redemptionKey,
    input,
    output,
    protocolMagic
  );
  if (!redeemResponse) {
    throw new SeedWithInvalidLengthError();
  } else if (redeemResponse.failed) {
    Logger.error('cryptoRedemption::getRedemptionSignedTransaction error: ' + redeemResponse.msg);
    throw new CreateRedeemTransactionError();
  }
  return redeemResponse;
}
