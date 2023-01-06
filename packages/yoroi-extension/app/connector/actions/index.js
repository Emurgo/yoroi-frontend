// @flow
import BaseProfileActions from '../../actions/base/base-profile-actions';
import DialogsActions from '../../actions/dialogs-actions';
import NotificationsActions from '../../actions/notifications-actions';
import ConnectorActions from './connector-actions';
import ExplorerActions from '../../actions/common/explorer-actions';
import AddressesActions from '../../actions/common/addresses-actions';

export type ActionsMap = {|
  profile: BaseProfileActions,
  dialogs: DialogsActions,
  explorers: ExplorerActions,
  notifications: NotificationsActions,
  connector: ConnectorActions,
  addresses: AddressesActions,
|};

const actionsMap: ActionsMap = Object.freeze({
  profile: new BaseProfileActions(),
  connector: new ConnectorActions(),
  dialogs: new DialogsActions(),
  explorers: new ExplorerActions(),
  notifications: new NotificationsActions(),
  addresses: new AddressesActions(),
});

export default actionsMap;
