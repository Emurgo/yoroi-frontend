// @flow

import { RustModule } from './rustLoader';
import { generateWalletRootKey as cardanoGenerateWalletRootKey } from './cryptoWallet';
import { CoinTypes, WalletTypePurpose } from '../../../../config/numbersConfig';
import type { NetworkRow } from '../storage/database/primitives/tables';
import type { WalletState } from '../../../../../chrome/extension/background/types';
import { bytesToHex, hexToBytes } from '../../../../coreUtils';

export function v4PublicToV2(
  v4Key: RustModule.WalletV4.Bip32PublicKey
): RustModule.WalletV2.PublicKey {
  return RustModule.WalletV2.PublicKey.from_hex(Buffer.from(v4Key.as_bytes()).toString('hex'));
}

export async function isWalletExist(
  wallets: Array<WalletState>,
  recoveryPhrase: string,
  accountIndex: number,
  selectedNetwork: $ReadOnly<NetworkRow>
): Promise<WalletState | void> {
  const rootPk = cardanoGenerateWalletRootKey(recoveryPhrase);
  const accountPublicKey = rootPk
    .derive(WalletTypePurpose.CIP1852)
    .derive(CoinTypes.CARDANO)
    .derive(accountIndex)
    .to_public();
  const publicKey = Buffer.from(accountPublicKey.as_bytes()).toString('hex');

  for (const wallet of wallets) {
    const existedPublicKey = wallet.publicKey;
    const walletNetworkId = wallet.networkId
    /**
     * We will still allow to restore the wallet on a different networks even they are
     * sharing the same recovery phrase but we are treating them differently
     */
    if (
      publicKey === existedPublicKey &&
      walletNetworkId === selectedNetwork.NetworkId
    ) {
      return wallet;
    }
  }
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
