// @flow

export type SortedRecoveryPhraseEntry = {|
  id: number,
  word: string,
  originalIdx: number,
|};

export function makeSortedPhrase(recoveryPhrase: Array<string>): SortedRecoveryPhraseEntry[] {
  return recoveryPhrase
    .map((word, idx) => ({ word, internalWordId: `${word}-${idx}` }))
    .sort((a, b) => a.word.localeCompare(b.word));
}
