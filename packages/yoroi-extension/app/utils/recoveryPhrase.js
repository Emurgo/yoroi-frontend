// @flow

export type SortedRecoveryPhraseEntry = {|
    id: number,
    word: string,
    originalIdx: number,
|};

export function makeSortedPhrase(recoveryPhrase: Array<string>): SortedRecoveryPhraseEntry[] {
  const sorted = recoveryPhrase.slice().sort();
  const wordIndexes = new Set();

  return sorted.map((sortedWord, sortedWordIdx) => {
    const originalIdx = recoveryPhrase.findIndex((originalWord, idx) => {
      return sortedWord === originalWord && !wordIndexes.has(idx)
    });

    if (originalIdx === -1) throw new Error('Word not found in the original recovery phrase. Should never happen');

    // Mark word index as watched to handle recovery phrase with duplicates
    wordIndexes.add(originalIdx);

     return {
      id: sortedWordIdx,
      word: sortedWord,
      originalIdx,
    };
  });
}