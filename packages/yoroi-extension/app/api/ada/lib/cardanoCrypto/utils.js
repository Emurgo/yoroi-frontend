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
