// @flow

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import BigNumber from 'bignumber.js';
import {
  DECIMAL_PLACES_IN_ADA,
} from '../../../../config/numbersConfig';
import type {
  BaseSignRequest,
} from '../types';
import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';

import type { ConfigType } from '../../../../../config/config-types';

declare var CONFIG: ConfigType;

export function normalizeKey(request: {|
  addressing: $PropertyType<Addressing, 'addressing'>,
  startingFrom: {|
    key: RustModule.WalletV3.Bip32PrivateKey,
    level: number,
  |},
|}): RustModule.WalletV3.Bip32PrivateKey {
  const startLevel = request.addressing.startLevel;
  const pathLength = request.addressing.path.length;

  const lastLevelSpecified = startLevel + pathLength - 1;
  if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
    throw new Error(`${nameof(normalizeKey)} incorrect addressing size ${lastLevelSpecified}`);
  }
  if (request.startingFrom.level + 1 < startLevel) {
    throw new Error(`${nameof(normalizeKey)} keyLevel < startLevel`);
  }
  let key = request.startingFrom.key;
  for (let i = request.startingFrom.level - startLevel + 1; i < pathLength; i++) {
    key = key.derive(request.addressing.path[i]);
  }
  return key;
}

export function getTxInputTotal(
  IOs: RustModule.WalletV3.InputOutput,
  shift: boolean
): BigNumber {
  let sum = new BigNumber(0);

  const inputs = IOs.inputs();
  for (let i = 0; i < inputs.size(); i++) {
    const input = inputs.get(i);
    const value = new BigNumber(input.value().to_str());
    sum = sum.plus(value);
  }
  if (shift) {
    return sum.shiftedBy(-DECIMAL_PLACES_IN_ADA);
  }
  return sum;
}

export function getTxOutputTotal(
  IOs: RustModule.WalletV3.InputOutput,
  shift: boolean
): BigNumber {
  let sum = new BigNumber(0);

  const outputs = IOs.outputs();
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i);
    const value = new BigNumber(output.value().to_str());
    sum = sum.plus(value);
  }
  if (shift) {
    return sum.shiftedBy(-DECIMAL_PLACES_IN_ADA);
  }
  return sum;
}

export function getShelleyTxFee(
  IOs: RustModule.WalletV3.InputOutput,
  shift: boolean,
): BigNumber {
  const out = getTxOutputTotal(IOs, false);
  const ins = getTxInputTotal(IOs, false);
  const result = ins.minus(out);
  if (shift) {
    return result.shiftedBy(-DECIMAL_PLACES_IN_ADA);
  }
  return result;
}

export function getShelleyTxReceivers(
  signRequest: BaseSignRequest<RustModule.WalletV3.InputOutput>,
  includeChange: boolean
): Array<string> {
  const receivers: Array<string> = [];

  const changeAddrs = new Set(signRequest.changeAddr.map(change => change.address));
  const outputs = signRequest.unsignedTx.outputs();
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i);
    const addr = Buffer.from(output.address().as_bytes()).toString('hex');
    if (!includeChange) {
      if (changeAddrs.has(addr)) {
        continue;
      }
    }
    receivers.push(addr);
  }
  return receivers;
}

export function shelleyTxEqual(
  req1: RustModule.WalletV3.InputOutput,
  req2: RustModule.WalletV3.InputOutput,
): boolean {
  const inputs1 = req1.inputs();
  const inputs2 = req2.inputs();
  if (inputs1.size() !== inputs2.size()) {
    return false;
  }

  const outputs1 = req1.outputs();
  const outputs2 = req2.outputs();
  if (outputs1.size() !== outputs2.size()) {
    return false;
  }

  for (let i = 0; i < inputs1.size(); i++) {
    const input1 = Buffer.from(inputs1.get(i).as_bytes()).toString('hex');
    const input2 = Buffer.from(inputs2.get(i).as_bytes()).toString('hex');
    if (input1 !== input2) {
      return false;
    }
  }
  for (let i = 0; i < outputs1.size(); i++) {
    const output1 = outputs1.get(i);
    const output2 = outputs2.get(i);

    if (output1.value().to_str() !== output2.value().to_str()) {
      return false;
    }
    const out1Addr = Buffer.from(output1.address().as_bytes()).toString('hex');
    const out2Addr = Buffer.from(output2.address().as_bytes()).toString('hex');
    if (out1Addr !== out2Addr) {
      return false;
    }
  }

  return true;
}

export function generateAuthData(
  bindingSignature: RustModule.WalletV3.AccountBindingSignature,
  certificate: RustModule.WalletV3.Certificate,
): RustModule.WalletV3.PayloadAuthData {
  if (certificate == null) {
    return RustModule.WalletV3.PayloadAuthData.for_no_payload();
  }

  switch (certificate.get_type()) {
    case RustModule.WalletV3.CertificateKind.StakeDelegation: {
      return RustModule.WalletV3.PayloadAuthData.for_stake_delegation(
        RustModule.WalletV3.StakeDelegationAuthData.new(
          bindingSignature
        )
      );
    }
    default: throw new Error('generateAuthData unexptected cert type ' + certificate.get_type());
  }
}

export function generateFee(): RustModule.WalletV3.Fee {
  const perCertificate = RustModule.WalletV3.PerCertificateFee.new();
  const genesisPerCert = CONFIG.genesis.linearFee.per_certificate_fees;
  if (genesisPerCert) {
    if (genesisPerCert.certificate_pool_registration != null) {
      perCertificate.set_pool_registration(
        RustModule.WalletV3.Value.from_str(genesisPerCert.certificate_pool_registration)
      );
    }
    if (genesisPerCert.certificate_stake_delegation != null) {
      perCertificate.set_stake_delegation(
        RustModule.WalletV3.Value.from_str(genesisPerCert.certificate_stake_delegation)
      );
    }
    if (genesisPerCert.certificate_owner_stake_delegation != null) {
      perCertificate.set_owner_stake_delegation(
        RustModule.WalletV3.Value.from_str(genesisPerCert.certificate_owner_stake_delegation)
      );
    }
  }

  const feeAlgorithm = RustModule.WalletV3.Fee.linear_fee(
    RustModule.WalletV3.Value.from_str(CONFIG.genesis.linearFee.constant),
    RustModule.WalletV3.Value.from_str(CONFIG.genesis.linearFee.coefficient),
    RustModule.WalletV3.Value.from_str(CONFIG.genesis.linearFee.certificate),
    perCertificate,
  );

  return feeAlgorithm;
}
