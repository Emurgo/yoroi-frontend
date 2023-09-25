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

export type Anchor = {|
  url: string,
  dataHash: string,
|};

export type Cip95Info = {|
  type: 'StakeRegistrationCert',
  coin: string | null,
|} | {|
  type: 'StakeDeregistrationCert',
  coin: string | null,
|} | {|
  type: 'StakeDelegationCert',
  poolKeyHash: string,
|} | {|
  type: 'VoteDelegCert',
  drep: string,
|} | {|
  type: 'StakeVoteDelegCert',
  poolKeyHash: string,
  drep: string,
|} | {|
  type: 'StakeRegDelegCert',
  poolKeyHash: string,
  coin: string,
|} | {|
  type: 'VoteRegDelegCert',
  drep: string,
  coin: string,
|} | {|
  type: 'StakeVoteRegDelegCert',
  poolKeyHash: string,
  drep: string,
  coin: string,
|} | {|
  type: 'RegDrepCert',
  coin: string,
  anchor: Anchor | null,
|} | {|
  type: 'UnregDrepCert',
  coin: string,
|} | {|
  type: 'UpdateDrepCert',
  anchor: Anchor | null,
|} | {|
  type: 'VotingProcedure',
  voterType: number,
  voterHash: string,
  govActionTxId: string,
  govActionIndex: string,
  vote: 0 | 1 | 2,
  anchor: Anchor,
|} | {|
  type: 'ProposalProcedure',
  deposit: string,
  reward_account: string,
  govAction: any, // todo
  anchor: Anchor,
|} | {|
  type: 'TresuryValue',
  coin: string,
|} | {|
  type: 'TresuryDonation',
  positiveCoin: string,
|}
export type CardanoConnectorSignRequest = {|
  inputs: Array<TxDataInput>,
  foreignInputs: Array<TxDataInput>,
  outputs: Array<TxDataOutput>,
  fee: TxDataFee,
  amount: MultiToken,
  total: MultiToken,
  cip95Info: Array<Cip95Info>,
|};

export type SignSubmissionErrorType = 'WRONG_PASSWORD' | 'SEND_TX_ERROR';
