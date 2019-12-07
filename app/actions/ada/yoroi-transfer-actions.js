// @flow
import Action from '../lib/Action';
import type { TransferSourceType, } from '../../types/TransferTypes';

export default class YoroiTranferActions {
  startTransferFunds: Action<{|
    source: TransferSourceType,
  |}> = new Action();
  startTransferPaperFunds: Action<{|
    source: TransferSourceType,
  |}> = new Action();
  startHardwareMnemnoic: Action<void> = new Action();
  startTransferLegacyHardwareFunds: Action<void> = new Action();
  setupTransferFundsWithMnemonic: Action<{|
    recoveryPhrase: string,
  |}> = new Action();
  setupTransferFundsWithPaperMnemonic: Action<{|
    recoveryPhrase: string,
    paperPassword: string,
  |}> = new Action();
  checkAddresses: Action<{|
    getDestinationAddress: void => Promise<string>,
  |}> = new Action();
  backToUninitialized: Action<void> = new Action();
  transferFunds: Action<{|
    next: void => Promise<void>,
    getDestinationAddress: void => Promise<string>,
    rebuildTx: boolean,
  |}> = new Action();
  cancelTransferFunds: Action<void> = new Action();
}
