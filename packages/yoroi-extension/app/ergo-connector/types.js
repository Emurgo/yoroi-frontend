// @flow
import { MultiToken } from '../api/common/lib/MultiToken';

// TODO: delete this and replace it with a Request object
export const LoadingWalletStates = Object.freeze({
  IDLE: 0,
  PENDING: 1,
  SUCCESS: 2,
  REJECTED: 3,
});

export type CardanoConnectorSignRequest = {|
  inputs: Array<{|
    address: string,
    value: MultiToken,
  |}>,
  outputs: Array<{|
    address: string,
    value: MultiToken,
  |}>,
  fee: {|
    tokenId: string,
    networkId: number,
    amount: string,
  |},
  amount: MultiToken,
  total: MultiToken,
|};

type SignSubmissionErrorType = 'WRONG_PASSWORD' | 'SEND_TX_ERROR';
