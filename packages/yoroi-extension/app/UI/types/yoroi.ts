import { Datum } from '@emurgo/yoroi-lib';
import { Balance } from '@yoroi/types';

export type YoroiUnsignedTx = YoroiTxInfo & {
  unsignedTx: any;
};

export type YoroiSignedTx = YoroiTxInfo & {
  signedTx: any;
};

export type YoroiTxInfo = {
  entries: YoroiEntry[];
  fee: Balance.Amounts;
  change: YoroiEntry[];
  metadata: YoroiMetadata;
  staking: YoroiStaking;
  voting: YoroiVoting;
  governance: boolean;
};

export type YoroiStaking = {
  registrations?: YoroiEntry[];
  deregistrations?: YoroiEntry[];
  delegations?: YoroiEntry[];
  withdrawals?: YoroiEntry[];
};

export type YoroiVoting = {
  registration?: {
    votingPublicKey: string;
    stakingPublicKey: string;
    rewardAddress: string;
    nonce: number;
  };
};

export type Address = string;
export type TokenId = string;

export type YoroiEntry = {
  address: Address;
  amounts: Balance.Amounts;
  datum?: Datum;
};

export type YoroiMetadata = {
  [label: string]: string;
};

export type YoroiNftModerationStatus = 'consent' | 'blocked' | 'approved' | 'pending' | 'manual_review';
