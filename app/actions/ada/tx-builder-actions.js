// @flow
import { Action } from '../lib/Action';
import type {
  IGetAllUtxosResponse,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

export default class TxBuilderActions {
  updateReceiver: Action<void | string> = new Action();
  updateAmount: Action<void | number> = new Action();
  updateTentativeTx: Action<void> = new Action();
  setFilter: Action<(ElementOf<IGetAllUtxosResponse> => boolean)> = new Action();
  toggleSendAll: Action<void> = new Action();
  reset: Action<void> = new Action();
}
