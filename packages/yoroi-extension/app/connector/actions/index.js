// @flow
import DialogsActions from '../../actions/dialogs-actions';
import ConnectorActions from './connector-actions';

export type ActionsMap = {|
  dialogs: DialogsActions,
  connector: ConnectorActions,
|};

const actionsMap: ActionsMap = Object.freeze({
  connector: new ConnectorActions(),
  dialogs: new DialogsActions(),
});

export default actionsMap;
