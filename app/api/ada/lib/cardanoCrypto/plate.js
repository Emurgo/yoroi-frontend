// @flow

// Utility functions for number plates (EmIP-001)
// https://github.com/Emurgo/EmIPs/blob/master/specs/emip-001.md

import { RustModule } from './rustLoader';
import type { GenerateAddressFunc } from '../adaAddressProcessing';
import { v2genAddressBatchFunc } from '../../restoration/byron/scan';
import blakejs from 'blakejs';
import crc32 from 'buffer-crc32';
import type { WalletAccountNumberPlate } from '../storage/models/PublicDeriver/interfaces';
import { HARD_DERIVATION_START } from '../../../../config/numbersConfig';
import { generateWalletRootKey } from './cryptoWallet';

const mnemonicsToAddresses = (
  generateAddressFunc: GenerateAddressFunc,
  pubKey: RustModule.WalletV2.PublicKey,
  count: number,
): {| addresses: Array<string>, accountPlate: WalletAccountNumberPlate |} => {
  const accountPlate = createAccountPlate(pubKey.to_hex());

  const addresses = generateAddressFunc([...Array(count).keys()]);
  return { addresses, accountPlate };
};

export function createAccountPlate(accountPubHash: string): WalletAccountNumberPlate {
  const hash = blakejs.blake2bHex(accountPubHash);
  const [a, b, c, d] = crc32(hash);
  const alpha = `ABCDEJHKLNOPSTXZ`;
  const letters = x => `${alpha[Math.floor(x / 16)]}${alpha[x % 16]}`;
  const numbers = `${((c << 8) + d) % 10000}`.padStart(4, '0');
  const id = `${letters(a)}${letters(b)}-${numbers}`;
  return { hash, id };
}

export const generateStandardPlate = (
  mnemonic: string,
  accountIndex: number,
  count: number,
  protocolMagic: number,
): {| addresses: Array<string>, accountPlate: WalletAccountNumberPlate |} => {
  const cryptoWallet = generateWalletRootKey(mnemonic);
  const account = cryptoWallet.bip44_account(
    RustModule.WalletV2.AccountIndex.new(accountIndex + HARD_DERIVATION_START)
  );
  const accountPublic = account.public();

  return mnemonicsToAddresses(
    // TODO: change to v3 addresses
    v2genAddressBatchFunc(
      accountPublic.bip44_chain(false),
      protocolMagic,
    ),
    accountPublic.key(),
    count
  );
};
