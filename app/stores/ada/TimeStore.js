// @flow

import { action, observable, runInAction, } from 'mobx';
import { find } from 'lodash';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import CachedRequest from '../lib/LocalizedCachedRequest';
import Store from '../base/Store';
import {
  genToAbsoluteSlotNumber,
  genToRelativeSlotNumber,
  genTimeToSlot,
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeSinceGenesis,
  genToRealTime,
} from '../../api/ada/lib/storage/bridge/timeUtils';
import type {
  ToAbsoluteSlotNumberFunc,
  ToRelativeSlotNumberFunc,
  TimeToAbsoluteSlotFunc,
  CurrentEpochLengthFunc,
  CurrentSlotLengthFunc,
  TimeSinceGenesisRequestFunc,
  ToRealTimeFunc,
} from '../../api/ada/lib/storage/bridge/timeUtils';

export type TimeCalcRequests = {|
  // TODO: key should be on network and not on public deriver
  publicDeriver: PublicDeriver<>,
  toAbsoluteSlot: CachedRequest<void => Promise<ToAbsoluteSlotNumberFunc>>;
  toRelativeSlotNumber: CachedRequest<void => Promise<ToRelativeSlotNumberFunc>>;
  timeToSlot: CachedRequest<void => Promise<TimeToAbsoluteSlotFunc>>;
  currentEpochLength: CachedRequest<void => Promise<CurrentEpochLengthFunc>>;
  currentSlotLength: CachedRequest<void => Promise<CurrentSlotLengthFunc>>;
  timeSinceGenesis: CachedRequest<void => Promise<TimeSinceGenesisRequestFunc>>,
  toRealTime: CachedRequest<void => Promise<ToRealTimeFunc>>;
|};

export type CurrentTimeRequests = {|
  // TODO: key should be on network and not on public deriver
  publicDeriver: PublicDeriver<>,
  currentEpoch: number,
  currentSlot: number,
  msIntoSlot: number,
|};

/**
 * Different wallets can be on different networks and therefore have different measures of time
*/
export default class TimeStore extends Store {
  @observable time: Date = new Date();

  /**
   * Note: theoretically these calculations can change during protocol execution
   * triggered by a special kind of state update on-chain
   * In such a case, the cache would have to be invalidated and re-generated from DB
   * TODO: implement this once this is more formalized in Cardano
   */
  @observable timeCalcRequests: Array<TimeCalcRequests> = [];

  @observable currentTimeRequests: Array<CurrentTimeRequests> = [];

  setup(): void {
    super.setup();
    setInterval(this._updateTime, 1000);
  }

  getTimeCalcRequests: PublicDeriver<> => TimeCalcRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.timeCalcRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(TimeStore)}::${nameof(this.getTimeCalcRequests)} missing for public deriver`);
  }

  getCurrentTimeRequests: PublicDeriver<> => CurrentTimeRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.currentTimeRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(TimeStore)}::${nameof(this.getCurrentTimeRequests)} missing for public deriver`);
  }

  @action addObserveTime: PublicDeriverWithCachedMeta => void = (
    publicDeriver
  ) => {
    this.timeCalcRequests.push({
      publicDeriver: publicDeriver.self,
      toAbsoluteSlot: new CachedRequest<void => Promise<ToAbsoluteSlotNumberFunc>>(
        genToAbsoluteSlotNumber
      ),
      toRelativeSlotNumber: new CachedRequest<void => Promise<ToRelativeSlotNumberFunc>>(
        genToRelativeSlotNumber
      ),
      timeToSlot: new CachedRequest<void => Promise<TimeToAbsoluteSlotFunc>>(
        genTimeToSlot
      ),
      currentEpochLength: new CachedRequest<void => Promise<CurrentEpochLengthFunc>>(
        genCurrentEpochLength
      ),
      currentSlotLength: new CachedRequest<void => Promise<CurrentSlotLengthFunc>>(
        genCurrentSlotLength
      ),
      timeSinceGenesis: new CachedRequest<void => Promise<TimeSinceGenesisRequestFunc>>(
        genTimeSinceGenesis
      ),
      toRealTime: new CachedRequest<void => Promise<ToRealTimeFunc>>(
        genToRealTime
      ),
    });

    this.currentTimeRequests.push({
      publicDeriver: publicDeriver.self,
      // initial values that can be updated later
      currentEpoch: 0,
      currentSlot: 0,
      msIntoSlot: 0,
    });
  }

  @action _updateTime = async (): Promise<void> => {
    const currTime = new Date();
    runInAction(() => { this.time = currTime; });

    for (const timeCalcRequest of this.timeCalcRequests) {
      const currentTimeRequest = this.getCurrentTimeRequests(timeCalcRequest.publicDeriver);

      const timeToSlot = await timeCalcRequest.timeToSlot.execute().promise;
      if (!timeToSlot) throw new Error(`${nameof(this._updateTime)} should never happen`);

      const currentAbsoluteSlot = timeToSlot({
        time: currTime
      });

      const toRelativeSlotNumber = await timeCalcRequest.toRelativeSlotNumber.execute().promise;
      if (!toRelativeSlotNumber) throw new Error(`${nameof(this._updateTime)} should never happen`);
      const currentRelativeTime = toRelativeSlotNumber(currentAbsoluteSlot.slot);

      runInAction(() => {
        currentTimeRequest.currentEpoch = currentRelativeTime.epoch;
        currentTimeRequest.currentSlot = currentRelativeTime.slot;
        currentTimeRequest.msIntoSlot = currentAbsoluteSlot.msIntoSlot;
      });
    }
  }
}
