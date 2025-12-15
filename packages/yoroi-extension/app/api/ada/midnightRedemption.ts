const NUMBER_OF_NIGHT_DECIMALS = 6;

export interface ThawData {
  address: string;
  schedule: {
    numberOfClaimedAllocations: number;
    thaws: {
      amount: number;
      queue_position: null;
      status: string; // 'upcoming'
      thawing_period_start: string; // "2026-03-03T00:00:00Z"
      transaction_id: null | string;
    }[];
  };
}

export function getRedeemable(thawData: ThawData): string {
  return '42';
}

export function getTotal(thawData: ThawData): string {
  return '42';
}

export type Status = 'notReady' | 'ready';

export function getStatus(thawData: ThawData): Status {
  return 'ready';
}
