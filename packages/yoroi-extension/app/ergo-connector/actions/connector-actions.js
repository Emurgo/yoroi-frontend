// @flow
import { AsyncAction, Action } from '../../actions/lib/Action';
import type { WhitelistEntry } from '../../../chrome/extension/ergo-connector/types';
import type { ConnectorStatus } from '../../api/localStorage'
// ======= CONNECTOR ACTIONS =======

export default class ConnectorActions {
  getResponse: AsyncAction<void> = new AsyncAction();
  getSigningMsg: AsyncAction<void> = new AsyncAction();
  refreshActiveSites: AsyncAction<void> = new AsyncAction();
  refreshWallets: AsyncAction<void> = new AsyncAction();
  closeWindow: Action<void> = new Action();
  getConnectorWhitelist: AsyncAction<void> = new AsyncAction();
  updateConnectorWhitelist: AsyncAction<{|
    whitelist: Array<WhitelistEntry>,
  |}> = new AsyncAction();
  removeWalletFromWhitelist: AsyncAction<string> = new AsyncAction();
  confirmSignInTx: Action<string> = new Action();
  cancelSignInTx: Action<void> = new Action();
  getConnectorStatus: AsyncAction<void> = new AsyncAction();
  toggleDappConnector: AsyncAction<void> = new AsyncAction();
}
