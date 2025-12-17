import React from 'react';
import moment from 'moment';
import EpochProgressWrapper from './EpochProgressWrapper';
import { useStaking } from '../../module/StakingContextProvider';

const EpochProgress: React.FC = () => {
  const { stores, selectedWallet } = useStaking();
  const timeCalcRequests = stores.substores.ada.time.getTimeCalcRequests(selectedWallet);
  const { toAbsoluteSlot, toRealTime, currentEpochLength } = timeCalcRequests.requests;

  const currTimeRequests = stores.substores.ada.time.getCurrentTimeRequests(selectedWallet);
  const currentEpoch: number = currTimeRequests.currentEpoch;

  const epochLength = currentEpochLength();

  const getDateFromEpoch = (epoch: number, returnEpochTime = false): string | Date => {
    const epochTime = toRealTime({
      absoluteSlotNum: toAbsoluteSlot({
        epoch,
        // Rewards are calculated at the start of the epoch but distributed at the end
        slot: epochLength,
      }),
    });

    return returnEpochTime ? epochTime : moment(epochTime).format('lll');
  };

  const endEpochDate = getDateFromEpoch(currentEpoch) as string;
  const endEpochDateTime = getDateFromEpoch(currentEpoch, true) as Date;
  const previousEpochDate = getDateFromEpoch(currentEpoch - 1) as string;

  const percentage = Math.floor((100 * currTimeRequests.currentSlot) / epochLength);

  return (
    <EpochProgressWrapper
      epochProgress={{
        startEpochDate: previousEpochDate,
        currentEpoch,
        endEpochDate,
        endEpochDateTime,
        percentage,
      }}
    />
  );
};

export default EpochProgress;
