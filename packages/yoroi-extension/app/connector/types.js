// @flow
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { MultiToken } from '../api/common/lib/MultiToken';
import type { TxDataOutput, TxDataInput } from '../api/common/types';

export type { TxDataOutput, TxDataInput } from '../api/common/types';

// TODO: delete this and replace it with a Request object
export const LoadingWalletStates = Object.freeze({
  IDLE: 0,
  PENDING: 1,
  SUCCESS: 2,
  REJECTED: 3,
});

export type ConnectorIntl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

export type TxDataFee = {|
  tokenId: string,
  networkId: number,
  amount: string,
|};

export type CardanoConnectorSignRequest = {|
  inputs: Array<TxDataInput>,
  foreignInputs: Array<TxDataInput>,
  outputs: Array<TxDataOutput>,
  fee: TxDataFee,
  amount: MultiToken,
  total: MultiToken,
|};

export type SignSubmissionErrorType = 'WRONG_PASSWORD' | 'SEND_TX_ERROR';
