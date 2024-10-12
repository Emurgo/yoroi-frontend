// @flow
import HWConnectActions from './hw-connect-actions';
import TrezorSendActions from './trezor-send-actions';
import LedgerSendActions from './ledger-send-actions';
import HWVerifyAddressActions from './hw-verify-address-actions';
import DelegationTransactionActions from './delegation-transaction-actions';
import VotingActions from './voting-actions';

export type AdaActionsMap = {|
  trezorConnect: HWConnectActions,
  trezorSend: TrezorSendActions,
  ledgerConnect: HWConnectActions,
  ledgerSend: LedgerSendActions,
  hwVerifyAddress: HWVerifyAddressActions,
  delegationTransaction: DelegationTransactionActions,
  voting: VotingActions,
|};

const adaActionsMap: AdaActionsMap = Object.freeze({
  trezorConnect: new HWConnectActions(),
  trezorSend: new TrezorSendActions(),
  ledgerConnect: new HWConnectActions(),
  ledgerSend: new LedgerSendActions(),
  hwVerifyAddress: new HWVerifyAddressActions(),
  delegationTransaction: new DelegationTransactionActions(),
  voting: new VotingActions,
});

export default adaActionsMap;
