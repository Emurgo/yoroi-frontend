// @flow
import BaseProfileActions from '../../actions/base/base-profile-actions';
import DialogsActions from '../../actions/dialogs-actions';
import NotificationsActions from '../../actions/notifications-actions';
import ConnectorActions from './connector-actions';

export type ActionsMap = {|
  profile: BaseProfileActions,
  dialogs: DialogsActions,
  notifications: NotificationsActions,
  connector: ConnectorActions,
|};

const actionsMap: ActionsMap = Object.freeze({
  profile: new BaseProfileActions(),
  connector: new ConnectorActions(),
  dialogs: new DialogsActions(),
  notifications: new NotificationsActions(),
});

export default actionsMap;
