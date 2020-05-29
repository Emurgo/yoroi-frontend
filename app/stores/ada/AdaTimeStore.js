// @flow

import { action, computed, observable, runInAction, } from 'mobx';
import { find } from 'lodash';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
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
import {
  CoinTypes,
} from '../../config/numbersConfig';
import {
  buildCheckAndCall,
} from '../lib/check';
import { ApiOptions } from '../../api/common/utils';

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
    timeSinceGenesis: CachedRequest<void => Promise<TimeSinceGenesisRequestFunc>>,
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
export default class AdaTimeStore extends Store {
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
    const { asyncCheck } = buildCheckAndCall(
      ApiOptions.ada,
      () => this.stores.profile.selectedAPI,
    );
    this.actions.time.tick.listen(asyncCheck(this._updateTime));
  }

  getTimeCalcRequests: PublicDeriver<> => TimeCalcRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.timeCalcRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(AdaTimeStore)}::${nameof(this.getTimeCalcRequests)} missing for public deriver`);
  }

  getCurrentTimeRequests: PublicDeriver<> => CurrentTimeRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.currentTimeRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(AdaTimeStore)}::${nameof(this.getCurrentTimeRequests)} missing for public deriver`);
  }

  @action addObservedTime: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    this.timeCalcRequests.push({
      publicDeriver,
      requests: {
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

  @action _updateTime: void => Promise<void> = async () => {
    const currTime = new Date();
    runInAction(() => { this.time = currTime; });

    const selected = this.stores.wallets.selected;
    if (selected == null) return;
    if (selected.getParent().getCoinType() !== CoinTypes.CARDANO) {
      return;
    }

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
      currTimeRequests.currentEpoch = currentRelativeTime.epoch;
      currTimeRequests.currentSlot = currentRelativeTime.slot;
      currTimeRequests.msIntoSlot = currentAbsoluteSlot.msIntoSlot;
    });
  }

  @computed get currentTime(): ?CurrentTimeRequests {
    // Get current public deriver
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return undefined;
    if (publicDeriver.getParent().getCoinType() !== CoinTypes.CARDANO) {
      return;
    }

    return this.getCurrentTimeRequests(publicDeriver);
  }
}
