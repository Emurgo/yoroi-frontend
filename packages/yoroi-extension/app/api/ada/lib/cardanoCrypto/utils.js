// @flow

import { RustModule } from './rustLoader';
import { bytesToHex, fail, forceNonNull, hexToBytes, iterateLenGet, maybe } from '../../../../coreUtils';
import { base32ToHex, hexToBase32 } from '../storage/bridge/utils';

export function v4PublicToV2(
  v4Key: RustModule.WalletV4.Bip32PublicKey
): RustModule.WalletV2.PublicKey {
  return RustModule.WalletV2.PublicKey.from_hex(bytesToHex(v4Key.as_bytes()));
}

export function poolIdHexToBech32(hex: string): string {
  return RustModule.WasmScope(Module =>
    Module.WalletV4.Ed25519KeyHash.from_hex(hex).to_bech32('pool'));
}

export function addressHexToBech32(hex: string): string {
  return RustModule.WasmScope(Module =>
    Module.WalletV4.Address.from_hex(hex).to_bech32());
}

export function addressBech32ToHex(bech32: string): string {
  return RustModule.WasmScope(Module =>
    Module.WalletV4.Address.from_bech32(bech32).to_hex());
}

export function transactionHexToWitnessSet(txHex: string): string {
  return RustModule.WasmScope(Module =>
    bytesToHex(Module.WalletV4.FixedTransaction.from_hex(txHex).raw_witness_set()));
}

export function transactionBodyHexToTransaction(txBodyHex: string): string {
  return RustModule.WasmScope(Module =>
    Module.WalletV4.FixedTransaction.new(
      hexToBytes(txBodyHex),
      Module.WalletV4.TransactionWitnessSet.new().to_bytes(),
      true,
    ).to_hex());
}

export function transactionHexToBodyHex(txHex: string): string {
  return RustModule.WasmScope(Module =>
    bytesToHex(Module.WalletV4.FixedTransaction.from_hex(txHex).raw_body()));
}

export function transactionHexToHash(txHex: string): string {
  return RustModule.WasmScope(Module =>
    Module.WalletV4.FixedTransaction.from_hex(txHex).transaction_hash().to_hex());
}

export function transactionHexReplaceWitnessSet(txHex: string, witnessSetHex: string): string {
  return RustModule.WasmScope(Module => {
    const fixedTransaction = Module.WalletV4.FixedTransaction.from_hex(txHex);
    fixedTransaction.set_witness_set(hexToBytes(witnessSetHex));
    return fixedTransaction.to_hex();
  });
}

export function transactionHexAddSignaturesFromWitnessSetHex(txHex: string, witnessSetHex: string): string {
  return RustModule.WasmScope(Module => {
    const fixedTransaction = Module.WalletV4.FixedTransaction.from_hex(txHex);
    const witnessSet = Module.WalletV4.TransactionWitnessSet.from_hex(witnessSetHex);
    for (const vkeyWitness of iterateLenGet(witnessSet.vkeys())) {
      fixedTransaction.add_vkey_witness(vkeyWitness);
    }
    for (const bootstrapWitness of iterateLenGet(witnessSet.bootstraps())) {
      fixedTransaction.add_bootstrap_witness(bootstrapWitness);
    }
    return fixedTransaction.to_hex();
  });
}

export function dRepToMaybeCredentialHex(s: string): ?string {
  const isPotentiallyValidHex = /^(22|23)[0-9a-fA-F]{56}$/.test(s);
  return RustModule.WasmScope(Module => {
    try {
      if (s.startsWith('drep1')) {
        if (s.length === 58) {
          // CIP129 drep1 encoding is extended value with internal prefix
          return maybe(base32ToHex(s), dRepToMaybeCredentialHex);
        }
        // Pre CIP129 drep1 encoding means same as drep_vkh1 now
        return Module.WalletV4.Credential
          .from_keyhash(Module.WalletV4.Ed25519KeyHash.from_bech32(s)).to_hex();
      }
      if (s.startsWith('drep_vkh1')) {
        return Module.WalletV4.Credential
          .from_keyhash(Module.WalletV4.Ed25519KeyHash.from_bech32(s)).to_hex();
      }
      if (s.startsWith('drep_script1')) {
        return Module.WalletV4.Credential
          .from_scripthash(Module.WalletV4.ScriptHash.from_bech32(s)).to_hex();
      }
      if (isPotentiallyValidHex && s.startsWith('22')) {
        return Module.WalletV4.Credential
          .from_keyhash(Module.WalletV4.Ed25519KeyHash.from_hex(s.substr(2))).to_hex();
      }
      if (isPotentiallyValidHex && s.startsWith('23')) {
        return Module.WalletV4.Credential
          .from_scripthash(Module.WalletV4.ScriptHash.from_hex(s.substr(2))).to_hex();
      }
    } catch {} // eslint-disable-line no-empty
    return null;
  })
}

function parseDrep(drep: string): ?{| hash: string, isScript: boolean |} {
  const credentialHex = dRepToMaybeCredentialHex(drep);
  if (!credentialHex) {
    return null;
  }
  return RustModule.WasmScope(Module => {
    const cred = Module.WalletV4.Credential.from_hex(credentialHex);
    const isScript = cred.kind() === Module.WalletV4.CredKind.Script;
    const hash = isScript ?
      forceNonNull(cred.to_scripthash()).to_hex()
      : forceNonNull(cred.to_keyhash()).to_hex();
    return { hash, isScript };
  })
}

export function dRepNormalize(drep: string, kind?: string): string {
  function encodeDrepHash(hash: string, isScript: boolean): string {
    // cip129 prefix
    const prefix = isScript ? '23' : '22';
    return hexToBase32(prefix + hash, 'drep');
  }
  if (kind != null) {
    // drep is hash hex
    return encodeDrepHash(drep, kind === 'scripthash');
  }
  if (drep.startsWith('drep1') && drep.length === 58) {
    // drep already cip129
    return drep;
  }
  return maybe(parseDrep(drep), r => encodeDrepHash(r.hash, r.isScript))
    ?? fail('Failed to normalize drep: ' + drep + ' | kind: ' + String(kind));
}

export function dRepToPreCip129(drep: string): string {
  if ((drep.startsWith('drep1') && drep.length < 58) || drep.startsWith('drep_script1')) {
    // drep already pre cip129 compatible
    return drep;
  }
  return maybe(parseDrep(drep), r => hexToBase32(r.hash, r.isScript ? 'drep_script' : 'drep'))
    ?? fail('Failed to normalize drep: ' + drep);
}

export function pubKeyHashToRewardAddress(hex: string, network: number): string {
  return RustModule.WasmScope(Module =>
    Module.WalletV4.RewardAddress.new(
      network,
      Module.WalletV4.Credential.from_keyhash(
        Module.WalletV4.Ed25519KeyHash.from_hex(hex),
      ),
    ).to_address().to_hex(),
  );
}

export const cip8Sign = async (
  address: Buffer,
  signKey: RustModule.WalletV4.PrivateKey,
  payload: Buffer,
): Promise<RustModule.MessageSigning.COSESign1> => {
  const protectedHeader = RustModule.MessageSigning.HeaderMap.new();
  protectedHeader.set_algorithm_id(
    RustModule.MessageSigning.Label.from_algorithm_id(
      RustModule.MessageSigning.AlgorithmId.EdDSA
    )
  );
  protectedHeader.set_header(
    RustModule.MessageSigning.Label.new_text('address'),
    RustModule.MessageSigning.CBORValue.new_bytes(address)
  );
  const protectedSerialized = RustModule.MessageSigning.ProtectedHeaderMap.new(protectedHeader);
  const unprotected = RustModule.MessageSigning.HeaderMap.new();
  const headers = RustModule.MessageSigning.Headers.new(protectedSerialized, unprotected);
  const builder = RustModule.MessageSigning.COSESign1Builder.new(headers, payload, false);
  const toSign = builder.make_data_to_sign().to_bytes();
  const signedSigStruct = signKey.sign(toSign).to_bytes();
  return builder.build(signedSigStruct);
}

export const buildCoseSign1FromSignature = async (
  address: Buffer,
  signature: Buffer,
  payload: Buffer,
  payloadHashed: boolean = false,
): Promise<RustModule.MessageSigning.COSESign1> => {
  const protectedHeader = RustModule.MessageSigning.HeaderMap.new();
  protectedHeader.set_algorithm_id(
    RustModule.MessageSigning.Label.from_algorithm_id(
      RustModule.MessageSigning.AlgorithmId.EdDSA
    )
  );
  protectedHeader.set_header(
    RustModule.MessageSigning.Label.new_text('address'),
    RustModule.MessageSigning.CBORValue.new_bytes(address)
  );
  const protectedSerialized = RustModule.MessageSigning.ProtectedHeaderMap.new(protectedHeader);
  const unprotected = RustModule.MessageSigning.HeaderMap.new();
  if (payloadHashed) {
    unprotected.set_header(
      RustModule.MessageSigning.Label.new_text('hashed'),
      RustModule.MessageSigning.CBORValue.new_special(
        RustModule.MessageSigning.CBORSpecial.new_bool(true)
      ),
    );
  }
  const headers = RustModule.MessageSigning.Headers.new(protectedSerialized, unprotected);
  const builder = RustModule.MessageSigning.COSESign1Builder.new(headers, payload, false);
  if (payloadHashed) {
    builder.hash_payload();
  }
  return builder.build(signature);
}

export const makeCip8Key: (Uint8Array) => RustModule.MessageSigning.COSEKey = (publicSigningKey) => {
  const key = RustModule.MessageSigning.COSEKey.new(
    RustModule.MessageSigning.Label.from_key_type(RustModule.MessageSigning.KeyType.OKP)
  );
  key.set_algorithm_id(
    RustModule.MessageSigning.Label.from_algorithm_id(RustModule.MessageSigning.AlgorithmId.EdDSA)
  );
  key.set_header(
    RustModule.MessageSigning.Label.new_int(
      RustModule.MessageSigning.Int.new_negative(RustModule.MessageSigning.BigNum.from_str('1'))
    ),
    RustModule.MessageSigning.CBORValue.new_int(
      RustModule.MessageSigning.Int.new_i32(6)
    )
  );
  key.set_header(
    RustModule.MessageSigning.Label.new_int(
      RustModule.MessageSigning.Int.new_negative(RustModule.MessageSigning.BigNum.from_str('2'))
    ),
    RustModule.MessageSigning.CBORValue.new_bytes(
      publicSigningKey
    )
  );

  return key;
}

function getWithdrawalKeyHashesFromTransactionBody(
  txBody: RustModule.WalletV4.TransactionBody,
): Set<string> {
  const result = new Set<string>();
  const withdrawals = txBody.withdrawals?.();
  if (withdrawals != null) {
    for (const rewardAddress of iterateLenGet(withdrawals.keys())) {
      maybe(rewardAddress.payment_cred().to_keyhash()?.to_hex(), x => result.add(x));
    }
  }
  return result;
}

function resolveCredential(
  cred: RustModule.WalletV4.Credential,
): {| keyHash: ?string, scriptHash: ?string |} {
  return {
    keyHash: cred.to_keyhash()?.to_hex(),
    scriptHash: cred.to_scripthash()?.to_hex(),
  };
}

function getCertificateStakeCredential(
  cert: RustModule.WalletV4.Certificate,
): ?{| keyHash: ?string, scriptHash: ?string |} {
  switch (cert.kind()) {
    case RustModule.WalletV4.CertificateKind.StakeRegistration:
      return resolveCredential(forceNonNull(cert.as_stake_registration()).stake_credential());
    case RustModule.WalletV4.CertificateKind.StakeDeregistration:
      return resolveCredential(forceNonNull(cert.as_stake_deregistration()).stake_credential());
    case RustModule.WalletV4.CertificateKind.StakeDelegation:
      return resolveCredential(forceNonNull(cert.as_stake_delegation()).stake_credential());
    case RustModule.WalletV4.CertificateKind.StakeAndVoteDelegation:
      return resolveCredential(forceNonNull(cert.as_stake_and_vote_delegation()).stake_credential());
    case RustModule.WalletV4.CertificateKind.StakeRegistrationAndDelegation:
      return resolveCredential(forceNonNull(cert.as_stake_registration_and_delegation()).stake_credential());
    case RustModule.WalletV4.CertificateKind.StakeVoteRegistrationAndDelegation:
      return resolveCredential(forceNonNull(cert.as_stake_vote_registration_and_delegation()).stake_credential());
    case RustModule.WalletV4.CertificateKind.VoteDelegation:
      return resolveCredential(forceNonNull(cert.as_vote_delegation()).stake_credential());
    case RustModule.WalletV4.CertificateKind.VoteRegistrationAndDelegation:
      return resolveCredential(forceNonNull(cert.as_vote_registration_and_delegation()).stake_credential());
    default:
      return null;
  }
}

function getCertificateKeyHashesFromTransactionBody(
  txBody: RustModule.WalletV4.TransactionBody,
): Set<string> {
  const result = new Set<string>();
  const certificates = txBody.certs?.();
  if (certificates != null) {
    for (const cert of iterateLenGet(certificates)) {
      maybe(getCertificateStakeCredential(cert)?.keyHash, x => result.add(x));
    }
  }
  return result;
}

export function getStakingKeyHashesInTransactionBody(txBodyHex: string): Set<string> {
  return RustModule.WasmScope(Module => {
    const txBody = Module.WalletV4.TransactionBody.from_hex(txBodyHex);
    const withdrawalKeys = getWithdrawalKeyHashesFromTransactionBody(txBody);
    const certificateKeys = getCertificateKeyHashesFromTransactionBody(txBody);
    return new Set([ ...withdrawalKeys, ...certificateKeys ]);
  });
}
