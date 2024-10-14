// @flow
import DialogsActions from '../../actions/dialogs-actions';

export type ActionsMap = {|
  dialogs: DialogsActions,
|};

const actionsMap: ActionsMap = Object.freeze({
  dialogs: new DialogsActions(),
});

export default actionsMap;
