// @flow
import ProfileActions from '../../actions/profile-actions';
import DialogsActions from '../../actions/dialogs-actions';
import NotificationsActions from '../../actions/notifications-actions';
import LoadingActions from '../../actions/loading-actions';

export type ActionsMap = {|
  profile: ProfileActions,
  dialogs: DialogsActions,
  notifications: NotificationsActions,
  loading: LoadingActions,
|};

const actionsMap: ActionsMap = Object.freeze({
  profile: new ProfileActions(),
  dialogs: new DialogsActions(),
  notifications: new NotificationsActions(),
  loading: new LoadingActions(),
});

export default actionsMap;
