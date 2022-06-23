// @flow
import { Action, AsyncAction } from '../lib/Action';
import type {
  IGetAllUtxosResponse,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { SetupSelfTxRequest } from '../../stores/toplevel/TransactionBuilderStore';
import type { TransactionMetadata } from '../../api/ada/lib/storage/bridge/metadataUtils';
import type { TokenRow, } from '../../api/ada/lib/storage/database/primitives/tables';
import BigNumber from 'bignumber.js';

export default class TxBuilderActions {
  updateReceiver: Action<void | string> = new Action();
  updateAmount: Action<?BigNumber> = new Action();
  updateMemo: Action<void | string> = new Action();
  addToken: Action<{|
    token?: $ReadOnly<TokenRow>,
    shouldReset?: boolean,
  |}> = new Action();
  deselectToken: Action<void> = new Action();
  removeTokens: Action<Array<$ReadOnly<TokenRow>>> = new Action();
  updateTentativeTx: Action<void> = new Action();
  setFilter: Action<(ElementOf<IGetAllUtxosResponse> => boolean)> = new Action();
  updateMetadata: Action<Array<TransactionMetadata> | void> = new Action();
  updateSendAllStatus: Action<void | boolean> = new Action();
  initialize: AsyncAction<SetupSelfTxRequest> = new AsyncAction();
  reset: Action<void> = new Action();
}
