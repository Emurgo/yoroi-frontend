// @flow

import { RustModule } from './rustLoader';
import { bytesToHex, hexToBytes } from '../../../../coreUtils';

export function v4PublicToV2(
  v4Key: RustModule.WalletV4.Bip32PublicKey
): RustModule.WalletV2.PublicKey {
  return RustModule.WalletV2.PublicKey.from_hex(Buffer.from(v4Key.as_bytes()).toString('hex'));
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

export function transactionHexToHash(txHex: string): string {
  return RustModule.WasmScope(Module =>
    Module.WalletV4.hash_transaction(Module.WalletV4.FixedTransaction.from_hex(txHex).body()).to_hex());
}

export function transactionHexReplaceWitnessSet(txHex: string, witnessSetHex: string): string {
  return RustModule.WasmScope(Module => {
    const fixedTransaction = Module.WalletV4.FixedTransaction.from_hex(txHex);
    fixedTransaction.set_witness_set(hexToBytes(witnessSetHex));
    return fixedTransaction.to_hex();
  });
}

export function dRepToMaybeCredentialHex(s: string): ?string {
  return RustModule.WasmScope(Module => {
    try {
      if (s.startsWith('drep1')) {
        return Module.WalletV4.Credential
          .from_keyhash(Module.WalletV4.Ed25519KeyHash.from_bech32(s)).to_hex();
      }
      if (s.startsWith('drep_script1')) {
        return Module.WalletV4.Credential
          .from_scripthash(Module.WalletV4.ScriptHash.from_bech32(s)).to_hex();
      }
    } catch {} // eslint-disable-line no-empty
    return null;
  })
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
