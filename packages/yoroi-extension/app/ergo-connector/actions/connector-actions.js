// @flow
import { AsyncAction, Action } from '../../actions/lib/Action';

// ======= CONNECTOR ACTIONS =======

export default class ConnectorActions {
  getResponse: AsyncAction<void> = new AsyncAction();
  getSigningMsg: AsyncAction<void> = new AsyncAction();
  getWallets: Action<void> = new Action();
  closeWindow: Action<void> = new Action();
  getConnectorWhitelist: AsyncAction<void> = new AsyncAction();
  removeWalletFromWhitelist: AsyncAction<string> = new AsyncAction();
  confirmSignInTx: Action<string> = new Action();
  cancelSignInTx: Action<void> = new Action();
}
