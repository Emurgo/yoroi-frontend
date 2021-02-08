// @flow
import { AsyncAction } from '../../actions/lib/Action';

// ======= CONNECTOR ACTIONS =======

export default class ConnectorActions {
  getResponse: AsyncAction<void> = new AsyncAction();
  getSigningMsg: AsyncAction<void> = new AsyncAction();
  getWallets: AsyncAction<void> = new AsyncAction();
  getConnectorWhitelist: AsyncAction<void> = new AsyncAction();
  removeWalletFromWhitelist: AsyncAction<void> = new AsyncAction();
  confirmSignInTx: AsyncAction<void> = new AsyncAction();
}
