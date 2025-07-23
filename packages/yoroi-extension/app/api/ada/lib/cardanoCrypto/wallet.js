// @flow

import {
  validateMnemonic,
} from 'bip39';

/** Check validity of mnemonic (including checksum) */
export const isValidBip39Mnemonic = (
  phrase: string,
  numberOfWords: number
): boolean => {
  // Note: splitting on spaces will not work for Japanese-encoded mnemonics who use \u3000 instead
  // We only use English mnemonics in Yoroi so this is okay.
  const split = phrase.split(' ');
  if (split.length !== numberOfWords) {
    return false;
  }
  return validateMnemonic(phrase);
};
