// @flow

import type { RestoreModeType, } from '../../actions/common/wallet-restore-actions';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import config from '../../config';

export function isPaperMode(mode: RestoreModeType): boolean {
  return mode === RestoreMode.PAPER;
}

export function getWordsCount(mode: RestoreModeType): number {
  switch (mode) {
    case (RestoreMode.PAPER):
      return config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT;
    case (RestoreMode.REGULAR_24):
      return config.wallets.DAEDALUS_SHELLEY_RECOVERY_PHRASE_WORD_COUNT;
    case (RestoreMode.REGULAR_15):
    default:
      return config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT;
  }
}
