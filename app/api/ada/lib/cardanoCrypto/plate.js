// @flow

// Utility functions for number plates (EmIP-001)
// https://github.com/Emurgo/EmIPs/blob/master/specs/emip-001.md

import { RustModule } from './rustLoader';
import type { GenerateAddressFunc } from '../adaAddressProcessing';
import { v2genAddressBatchFunc } from '../../restoration/byron/scan';
import { genSingleAddressBatchFunc } from '../../restoration/shelley/scan';
import blakejs from 'blakejs';
import crc32 from 'buffer-crc32';
import type { WalletAccountNumberPlate } from '../storage/models/PublicDeriver/interfaces';
import { generateWalletRootKey } from './cryptoWallet';
import {
  HARD_DERIVATION_START,
  CoinTypes,
  WalletTypePurpose,
  ChainDerivations,
} from '../../../../config/numbersConfig';
import type { AddressDiscriminationType } from '@emurgo/js-chain-libs/js_chain_libs';

const mnemonicsToAddresses = (
  generateAddressFunc: GenerateAddressFunc,
  pubKey: string,
  count: number,
): {| addresses: Array<string>, accountPlate: WalletAccountNumberPlate |} => {
  const accountPlate = createAccountPlate(pubKey);

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
  discrimination: AddressDiscriminationType,
  legacy: boolean,
): {| addresses: Array<string>, accountPlate: WalletAccountNumberPlate |} => {
  const cryptoWallet = generateWalletRootKey(mnemonic);
  const accountKey = cryptoWallet
    .derive(legacy ? WalletTypePurpose.BIP44 : WalletTypePurpose.CIP1852)
    .derive(CoinTypes.CARDANO)
    .derive(accountIndex + HARD_DERIVATION_START);
  const accountPublic = accountKey.to_public();
  const chainKey = accountPublic.derive(ChainDerivations.EXTERNAL);

  return mnemonicsToAddresses(
    // add: add v3 addresses options
    legacy
      ? v2genAddressBatchFunc(
        RustModule.WalletV2.Bip44ChainPublic.new(
          RustModule.WalletV2.PublicKey.from_hex(
            Buffer.from(chainKey.as_bytes()).toString('hex')
          ),
          RustModule.WalletV2.DerivationScheme.v2()
        ),
      )
      : genSingleAddressBatchFunc(
        chainKey,
        discrimination,
      ),
    Buffer.from(accountPublic.as_bytes()).toString('hex'),
    count
  );
};
