// @flow
import { AsyncAction } from '../../actions/lib/Action';
// ======= CONNECTOR ACTIONS =======

export default class ConnectorActions {
  removeWalletFromWhitelist: AsyncAction<{|
    url: string,
  |}> = new AsyncAction();
}
