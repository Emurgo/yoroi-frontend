// @flow
import DialogsActions from '../../actions/dialogs-actions';
import NotificationsActions from '../../actions/notifications-actions';
import ConnectorActions from './connector-actions';

export type ActionsMap = {|
  dialogs: DialogsActions,
  notifications: NotificationsActions,
  connector: ConnectorActions,
|};

const actionsMap: ActionsMap = Object.freeze({
  connector: new ConnectorActions(),
  dialogs: new DialogsActions(),
  notifications: new NotificationsActions(),
});

export default actionsMap;
