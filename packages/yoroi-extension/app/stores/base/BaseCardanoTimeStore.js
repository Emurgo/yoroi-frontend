// @flow

import { action, computed, observable, runInAction, } from 'mobx';
import { find } from 'lodash';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import CachedRequest from '../lib/LocalizedCachedRequest';
import Store from './Store';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type {
  CurrentEpochLengthFunc,
  CurrentSlotLengthFunc,
  TimeSinceGenesisFunc, TimeToAbsoluteSlotFunc, ToAbsoluteSlotNumberFunc,
  ToRealTimeFunc, ToRelativeSlotNumberFunc
} from '../../api/ada/lib/storage/bridge/timeUtils';
import { getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  genCurrentEpochLength, genCurrentSlotLength, genTimeSinceGenesis,
  genTimeToSlot,
  genToAbsoluteSlotNumber, genToRealTime,
  genToRelativeSlotNumber
} from '../../api/ada/lib/storage/bridge/timeUtils';

export type TimeCalcRequests = {|
  // although time is network-specific
  // time settings can change over duration of blockchain
  // so it depends how much the blockchain has synced for a given wallet
  publicDeriver: PublicDeriver<>,
  requests: {|
    toAbsoluteSlot: CachedRequest<void => Promise<ToAbsoluteSlotNumberFunc>>;
    toRelativeSlotNumber: CachedRequest<void => Promise<ToRelativeSlotNumberFunc>>;
    timeToSlot: CachedRequest<void => Promise<TimeToAbsoluteSlotFunc>>;
    currentEpochLength: CachedRequest<void => Promise<CurrentEpochLengthFunc>>;
    currentSlotLength: CachedRequest<void => Promise<CurrentSlotLengthFunc>>;
    timeSinceGenesis: CachedRequest<void => Promise<TimeSinceGenesisFunc>>,
    toRealTime: CachedRequest<void => Promise<ToRealTimeFunc>>;
  |},
|};

export type CurrentTimeRequests = {|
  // although time is network-specific
  // time settings can change over duration of blockchain
  // so it depends how much the blockchain has synced for a given wallet
  publicDeriver: PublicDeriver<>,
  currentEpoch: number,
  currentSlot: number,
  msIntoSlot: number,
|};

/**
 * Different wallets can be on different networks and therefore have different measures of time
*/
export default class BaseCardanoTimeStore extends Store<StoresMap, ActionsMap> {

  @observable time: Date = new Date();

  /**
   * Note: theoretically these calculations can change during protocol execution
   * triggered by a special kind of state update on-chain
   * In such a case, the cache would have to be invalidated and re-generated from DB
   * TODO: implement this once this is more formalized in Cardano
   */
  @observable timeCalcRequests: Array<TimeCalcRequests> = [];

  @observable currentTimeRequests: Array<CurrentTimeRequests> = [];

  _intervalId: void | IntervalID;

  setup(): void {
    super.setup();
    // note: doesn't await but that's okay
    this._intervalId = setInterval(this._updateTime, 1000);
  }

  teardown(): void {
    super.teardown();
    if (this._intervalId) clearInterval(this._intervalId);
  }

  @action addObservedTime: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    const baseConfig = getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo());
    this.timeCalcRequests.push({
      publicDeriver,
      requests: {
        toAbsoluteSlot: new CachedRequest<void => Promise<ToAbsoluteSlotNumberFunc>>(
          () => Promise.resolve(genToAbsoluteSlotNumber(baseConfig))
        ),
        toRelativeSlotNumber: new CachedRequest<void => Promise<ToRelativeSlotNumberFunc>>(
          () => Promise.resolve(genToRelativeSlotNumber(baseConfig))
        ),
        timeToSlot: new CachedRequest<void => Promise<TimeToAbsoluteSlotFunc>>(
          () => Promise.resolve(genTimeToSlot(baseConfig))
        ),
        currentEpochLength: new CachedRequest<void => Promise<CurrentEpochLengthFunc>>(
          () => Promise.resolve(genCurrentEpochLength(baseConfig))
        ),
        currentSlotLength: new CachedRequest<void => Promise<CurrentSlotLengthFunc>>(
          () => Promise.resolve(genCurrentSlotLength(baseConfig))
        ),
        timeSinceGenesis: new CachedRequest<void => Promise<TimeSinceGenesisFunc>>(
          () => Promise.resolve(genTimeSinceGenesis(baseConfig))
        ),
        toRealTime: new CachedRequest<void => Promise<ToRealTimeFunc>>(
          () => Promise.resolve(genToRealTime(baseConfig))
        ),
      },
    });

    this.currentTimeRequests.push({
      publicDeriver,
      // initial values that can be updated later
      currentEpoch: 0,
      currentSlot: 0,
      msIntoSlot: 0,
    });
  }


  getTimeCalcRequests: PublicDeriver<> => TimeCalcRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.timeCalcRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(BaseCardanoTimeStore)}::${nameof(this.getTimeCalcRequests)} missing for public deriver`);
  }

  getCurrentTimeRequests: PublicDeriver<> => CurrentTimeRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.currentTimeRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(BaseCardanoTimeStore)}::${nameof(this.getCurrentTimeRequests)} missing for public deriver`);
  }

  @action _updateTime: void => Promise<void> = async () => {
    const currTime = new Date();
    runInAction(() => { this.time = currTime; });

    const selected = this.stores.wallets.selected;
    if (selected == null) return;

    const timeCalcRequests = this.getTimeCalcRequests(selected);
    const currTimeRequests = this.getCurrentTimeRequests(selected);

    const timeToSlot = await timeCalcRequests.requests.timeToSlot.execute().promise;
    if (!timeToSlot) throw new Error(`${nameof(this._updateTime)} should never happen`);

    const currentAbsoluteSlot = timeToSlot({
      time: currTime
    });

    const toRelativeSlotNumber = await timeCalcRequests.requests
      .toRelativeSlotNumber.execute().promise;
    if (!toRelativeSlotNumber) throw new Error(`${nameof(this._updateTime)} should never happen`);
    const currentRelativeTime = toRelativeSlotNumber(currentAbsoluteSlot.slot);

    runInAction(() => {
      if (currTimeRequests.currentEpoch !== currentRelativeTime.epoch) {
        // Clearing processed withdrawals in case epoch changes
        this.stores.transactions.clearProcessedWithdrawals(selected);
        currTimeRequests.currentEpoch = currentRelativeTime.epoch;
      }
      currTimeRequests.currentSlot = currentRelativeTime.slot;
      currTimeRequests.msIntoSlot = currentAbsoluteSlot.msIntoSlot;
    });
  }

  @computed get currentTime(): ?CurrentTimeRequests {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return undefined;
    return this.getCurrentTimeRequests(publicDeriver);
  }
}
