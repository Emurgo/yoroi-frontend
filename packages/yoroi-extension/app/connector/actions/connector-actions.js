// @flow
import { AsyncAction } from '../../actions/lib/Action';
import type { WhitelistEntry } from '../../../chrome/extension/connector/types';
// ======= CONNECTOR ACTIONS =======

export default class ConnectorActions {
  updateConnectorWhitelist: AsyncAction<{|
    whitelist: Array<WhitelistEntry>,
  |}> = new AsyncAction();
  removeWalletFromWhitelist: AsyncAction<{|
    url: string,
  |}> = new AsyncAction();
}
