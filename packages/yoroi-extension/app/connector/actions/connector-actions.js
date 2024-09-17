// @flow
import { AsyncAction, Action } from '../../actions/lib/Action';
import type { WhitelistEntry } from '../../../chrome/extension/connector/types';
// ======= CONNECTOR ACTIONS =======

export default class ConnectorActions {
  refreshActiveSites: AsyncAction<void> = new AsyncAction();
  refreshWallets: AsyncAction<void> = new AsyncAction();
  closeWindow: Action<void> = new Action();
  getConnectorWhitelist: AsyncAction<void> = new AsyncAction();
  updateConnectorWhitelist: AsyncAction<{|
    whitelist: Array<WhitelistEntry>,
  |}> = new AsyncAction();
  removeWalletFromWhitelist: AsyncAction<{|
    url: string,
  |}> = new AsyncAction();
  confirmSignInTx: AsyncAction<string> = new AsyncAction();
  cancelSignInTx: Action<void> = new Action();
}
