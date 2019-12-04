// @flow
import Action from '../lib/Action';
import type { TransferType } from '../../types/TransferTypes';

export default class YoroiTranferActions {
  startTransferFunds: Action<void> = new Action();
  startTransferPaperFunds: Action<void> = new Action();
  setupTransferFundsWithMnemonic: Action<{|
    recoveryPhrase: string,
  |}> = new Action();
  setupTransferFundsWithPaperMnemonic: Action<{|
    recoveryPhrase: string,
    paperPassword: string,
  |}> = new Action();
  checkAddresses: Action<{|
    getDestinationAddress: void => Promise<string>,
    transferKind: TransferType,
  |}> = new Action();
  backToUninitialized: Action<void> = new Action();
  transferFunds: Action<{
    next: void => void,
    getDestinationAddress: void => Promise<string>,
    transferKind: TransferType,
  }> = new Action();
  cancelTransferFunds: Action<void> = new Action();
}
