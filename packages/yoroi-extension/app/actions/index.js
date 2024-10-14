// @flow
import DialogsActions from './dialogs-actions';
import  ConnectorActionsMap from '../connector/actions/connector-actions';

export type ActionsMap = {|
  dialogs: DialogsActions,
  connector: ConnectorActionsMap,
|};

const actionsMap: ActionsMap = Object.freeze({
  dialogs: new DialogsActions(),
  connector: new ConnectorActionsMap(),
});

export default actionsMap;
