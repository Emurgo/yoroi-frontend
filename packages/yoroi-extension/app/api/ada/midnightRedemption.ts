import BigNumber from 'bignumber.js';
const NUMBER_OF_NIGHT_DECIMALS = 6;

// not sure what each status means
type ThawStatus =
  | 'upcoming'
  | 'queued'
  | 'redeemable'
  | 'submitted'
  | 'failed'
  | 'confirming'
  | 'confirmed'
  | 'skipped';
  
export interface Schedule {
  numberOfClaimedAllocations: number;
  thaws: {
    amount: number;
    queue_position: null;
    status: ThawStatus
    thawing_period_start: string; // "2026-03-03T00:00:00Z"
    transaction_id: null | string;
  }[];
}

function formatNumber(n: number): string {
  return (new BigNumber(n)).shiftedBy(-NUMBER_OF_NIGHT_DECIMALS).toFixed(2);
}

// guesswork
function getRedeemableAmount(schedule: Schedule): number {
  return schedule.thaws
    .slice(schedule.numberOfClaimedAllocations)
    .filter(thaw => thaw.status === 'redeemable')
    .reduce((accu, thaw) => accu + thaw.amount, 0);
}

export function getRedeemable(schedule: Schedule): string {
  return formatNumber(getRedeemableAmount(schedule));
    
}

export function getTotal(schedule: Schedule): string {
  return formatNumber(schedule.thaws.reduce((accu, thaw) => accu + thaw.amount, 0));
}

export type Status = 'notReady' | 'ready';

export function getStatus(schedule: Schedule): Status {
  if (getRedeemableAmount(schedule) > 0) {
    return 'ready';
  } else {
    return 'notReady';
  }
}
