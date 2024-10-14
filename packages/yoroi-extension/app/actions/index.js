// @flow
import DialogsActions from './dialogs-actions';
import TxBuilderActions from './common/tx-builder-actions';
import  ConnectorActionsMap from '../connector/actions/connector-actions';

export type ActionsMap = {|
  txBuilderActions: TxBuilderActions,
  dialogs: DialogsActions,
  connector: ConnectorActionsMap,
|};

const actionsMap: ActionsMap = Object.freeze({
  txBuilderActions: new TxBuilderActions(),
  dialogs: new DialogsActions(),
  connector: new ConnectorActionsMap(),
});

export default actionsMap;
