// @flow
import { Action, AsyncAction } from '../lib/Action';
import type {
  IGetAllUtxosResponse,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { SetupSelfTxRequest } from '../../stores/ada/AdaTransactionBuilderStore';

export default class TxBuilderActions {
  updateReceiver: Action<void | string> = new Action();
  updateAmount: Action<void | number> = new Action();
  updateMemo: Action<void | string> = new Action();
  updateTentativeTx: Action<void> = new Action();
  setFilter: Action<(ElementOf<IGetAllUtxosResponse> => boolean)> = new Action();
  toggleSendAll: Action<void> = new Action();
  initialize: AsyncAction<SetupSelfTxRequest> = new AsyncAction();
  reset: Action<void> = new Action();
}
