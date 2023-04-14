// @flow

import { makeSortedPhrase } from './recoveryPhrase';

describe('makeSortedPhrase()', () => {
  test('sort recovery phrase with unique words', () => {
    const phraseWithUniqueWords = ['b', 'a', 'c'];
    const sorted = makeSortedPhrase(phraseWithUniqueWords);

    const [first, second, third] = sorted;
    expect(first.word).toBe('a');
    expect(first.internalWordId).toBe('a-1');

    expect(second.word).toBe('b');
    expect(second.internalWordId).toBe('b-0');

    expect(third.word).toBe('c');
    expect(third.internalWordId).toBe('c-2');
  });

  test('sort recovery phrase with duplicates', () => {
    const recoveryPhraseWithDuplicates = ['abandon', 'address', 'abandon'];
    const sorted = makeSortedPhrase(recoveryPhraseWithDuplicates);

    const [first, second, third] = sorted;
    expect(first.word).toBe('abandon');
    expect(first.internalWordId).toBe('abandon-0');

    expect(second.word).toBe('abandon');
    expect(second.internalWordId).toBe('abandon-2');

    expect(third.word).toBe('address');
    expect(third.internalWordId).toBe('address-1');
  });
});
