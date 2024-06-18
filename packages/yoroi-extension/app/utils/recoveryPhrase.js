// @flow

type SortedRecoveryPhraseEntry = {|
  word: string,
  internalWordId: string,
|};

export function makeSortedPhrase(recoveryPhrase: Array<string>): SortedRecoveryPhraseEntry[] {
  return recoveryPhrase
    .map((word, idx) => ({ word, internalWordId: `${word}-${idx}` }))
    .sort((a, b) => a.word.localeCompare(b.word));
}
