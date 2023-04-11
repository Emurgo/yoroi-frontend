// @flow

import { makeSortedPhrase } from './recoveryPhrase';

describe('makeSortedPhrase()', () => {
  test('sort recovery phrase with unique words', () => {
    const phraseWithUniqueWords = ['w_3', 'w_2', 'w_1'];
    const sorted = makeSortedPhrase(phraseWithUniqueWords);

    const [first, second, third] = sorted;
    expect(first.word).toBe('w_1');
    expect(first.originalIdx).toBe(2);

    expect(second.word).toBe('w_2');
    expect(second.originalIdx).toBe(1);

    expect(third.word).toBe('w_3');
    expect(third.originalIdx).toBe(0);
  });

  test('sort recovery phrase with duplicates', () => {
    const recoveryPhraseWithDuplicates = ['abandon', 'address', 'abandon'];
    const sorted = makeSortedPhrase(recoveryPhraseWithDuplicates);

    const [first, second, third] = sorted;
    expect(first.word).toBe('abandon');
    expect(first.originalIdx).toBe(0);

    expect(second.word).toBe('abandon');
    expect(second.originalIdx).toBe(2);

    expect(third.word).toBe('address');
    expect(third.originalIdx).toBe(1);
  });
});
