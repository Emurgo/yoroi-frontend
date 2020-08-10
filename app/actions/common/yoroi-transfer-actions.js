// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { RestoreModeType } from './wallet-restore-actions';

export default class YoroiTransferActions {
  startTransferFunds: Action<{|
    source: RestoreModeType,
  |}> = new Action();
  startHardwareMnemonic: Action<void> = new Action();
  setupTransferFundsWithMnemonic: Action<{|
    recoveryPhrase: string,
  |}> = new Action();
  setupTransferFundsWithPaperMnemonic: Action<{|
    recoveryPhrase: string,
    paperPassword: string,
  |}> = new Action();
  checkAddresses: AsyncAction<{|
    getDestinationAddress: void => Promise<string>,
  |}> = new AsyncAction();
  backToUninitialized: Action<void> = new Action();
  transferFunds: AsyncAction<{|
    next: void => Promise<void>,
    getDestinationAddress: void => Promise<string>,
    rebuildTx: boolean,
  |}> = new AsyncAction();
  cancelTransferFunds: Action<void> = new Action();
}
