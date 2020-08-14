// @flow

import { AsyncAction, Action } from '../lib/Action';
import config from '../../config';

export type WalletRestoreMeta = {|
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  paperPassword: string,
|};

export type RestoreModeType = {|
  type: 'bip44',
  extra: void,
  length: (
    typeof config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT |
    typeof config.wallets.DAEDALUS_RECOVERY_PHRASE_WORD_COUNT
  ),
|} | {|
  type: 'cip1852',
  extra: void,
  chain?: number,
  length: (
    typeof config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT |
    typeof config.wallets.DAEDALUS_SHELLEY_RECOVERY_PHRASE_WORD_COUNT
  ),
|} | {|
  // note: we didn't allow paper wallet creation during the ITN
  // but we did allow paper wallet restoration
  type: 'bip44' | 'cip1852',
  extra: 'paper',
  length: (
    typeof config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT |
    typeof config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT
  ),
  chain?: number,
|} | {|
  type: 'bip44' | 'cip1852',
  extra: 'ledger' | 'trezor',
|};

export default class WalletRestoreActions {
  submitFields: Action<WalletRestoreMeta> = new Action();
  startRestore: AsyncAction<void> = new AsyncAction();
  verifyMnemonic: AsyncAction<void> = new AsyncAction();
  startCheck: AsyncAction<void> = new AsyncAction();
  setMode: Action<RestoreModeType> = new Action();
  reset: Action<void> = new Action();
  back: Action<void> = new Action();
  transferFromLegacy: AsyncAction<void> = new AsyncAction();
}
