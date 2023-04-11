// @flow

export type SortedRecoveryPhraseEntry = {|
  id: number,
  word: string,
  originalIdx: number,
|};

export function makeSortedPhrase(recoveryPhrase: Array<string>): SortedRecoveryPhraseEntry[] {
  return recoveryPhrase
    .map((word, originalIdx) => ({ word, originalIdx }))
    .sort((a, b) => a.word.localeCompare(b.word));
}
