// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { TransferSourceType, TransferKindType, } from '../../types/TransferTypes';

export default class YoroiTransferActions {
  startTransferFunds: Action<{|
    source: TransferSourceType,
  |}> = new Action();
  startTransferPaperFunds: Action<{|
    source: TransferSourceType,
  |}> = new Action();
  startHardwareMnemonic: Action<void> = new Action();
  startTransferLegacyHardwareFunds: Action<TransferKindType> = new Action();
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
