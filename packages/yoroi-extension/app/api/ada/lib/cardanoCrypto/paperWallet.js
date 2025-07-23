// @flow

import {
  mnemonicToEntropy,
} from 'bip39';

import { Logger, stringifyError } from '../../../../utils/logging';

import { RustModule } from './rustLoader';
import {
  isValidBip39Mnemonic
} from './wallet';
import config from '../../../../config';
import { hexToBytes } from '../../../../coreUtils';

// <TODO:PENDING_REMOVAL> paper
/** Check validity of paper mnemonic (including checksum) */
export const isValidEnglishAdaPaperMnemonic = (
  phrase: string,
  numberOfWords: number
): boolean => {
  // Any password will return some valid unscrambled mnemonic
  // so we just pass a fake password to pass downstream validation
  const fakePassword = numberOfWords === config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT
    ? 'xxx'
    : undefined;
  const [unscrambled, unscrambledLen] =
    unscramblePaperAdaMnemonic(phrase, numberOfWords, fakePassword);
  if (unscrambled != null && unscrambledLen) {
    return isValidBip39Mnemonic(unscrambled, unscrambledLen);
  }
  return false;
};

// <TODO:PENDING_REMOVAL> paper
/** Check validity of paper mnemonic (including checksum) */
export const unscramblePaperAdaMnemonic = (
  phrase: string,
  numberOfWords: number,
  password?: string,
): [?string, number] => {
  const words = phrase.split(' ');
  if (words.length === numberOfWords) {
    if (numberOfWords === config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT) {
      if (password == null) {
        throw new Error(
          `Password is expected for a ${config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT}-word paper!`
        );
      }
      try {
        const entropy = mnemonicToEntropy(phrase);
        const mnemonics = RustModule.WasmScope(Scope => {
          const newEntropy = Scope.WalletV2.paper_wallet_unscramble(
            hexToBytes(entropy),
            password || ''
          );

          return newEntropy.to_english_mnemonics();
        });

        return [
          mnemonics,
          config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT
        ];
      } catch (e) {
        Logger.error('Failed to unscramble paper mnemonic! ' + stringifyError(e));
        return [undefined, 0];
      }
    }
  }
  return [undefined, 0];
};
