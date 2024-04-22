// @flow

import { action, computed, } from 'mobx';
import CachedRequest from '../lib/LocalizedCachedRequest';
import BaseCardanoTimeStore from '../base/BaseCardanoTimeStore';
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
  TimeSinceGenesisFunc,
  ToRealTimeFunc,
} from '../../api/common/lib/storage/bridge/timeUtils';
import type { CurrentTimeRequests } from '../base/BaseCardanoTimeStore';
import {
  getCardanoHaskellBaseConfig,
  getNetworkById,
} from '../../api/ada/lib/storage/database/prepackaged/networks';

/**
 * Different wallets can be on different networks and therefore have different measures of time
*/
export default class AdaTimeStore extends BaseCardanoTimeStore {

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

  @action addObservedTime: (number, number) => void = (
    publicDeriverId, networkId
  ) => {
    const networkInfo = getNetworkById(networkId);

    this.timeCalcRequests.push({
      publicDeriverId,
      requests: {
        toAbsoluteSlot: new CachedRequest<void => Promise<ToAbsoluteSlotNumberFunc>>(
          () => genToAbsoluteSlotNumber(
            getCardanoHaskellBaseConfig(networkInfo)
          )
        ),
        toRelativeSlotNumber: new CachedRequest<void => Promise<ToRelativeSlotNumberFunc>>(
          () => genToRelativeSlotNumber(
            getCardanoHaskellBaseConfig(networkInfo)
          )
        ),
        timeToSlot: new CachedRequest<void => Promise<TimeToAbsoluteSlotFunc>>(
          () => genTimeToSlot(
            getCardanoHaskellBaseConfig(networkInfo)
          )
        ),
        currentEpochLength: new CachedRequest<void => Promise<CurrentEpochLengthFunc>>(
          () => genCurrentEpochLength(
            getCardanoHaskellBaseConfig(networkInfo)
          )
        ),
        currentSlotLength: new CachedRequest<void => Promise<CurrentSlotLengthFunc>>(
          () => genCurrentSlotLength(
            getCardanoHaskellBaseConfig(networkInfo)
          )
        ),
        timeSinceGenesis: new CachedRequest<void => Promise<TimeSinceGenesisFunc>>(
          () => genTimeSinceGenesis(
            getCardanoHaskellBaseConfig(networkInfo)
          )
        ),
        toRealTime: new CachedRequest<void => Promise<ToRealTimeFunc>>(
          () => genToRealTime(
            getCardanoHaskellBaseConfig(networkInfo)
          )
        ),
      },
    });

    this.currentTimeRequests.push({
      publicDeriverId,
      // initial values that can be updated later
      currentEpoch: 0,
      currentSlot: 0,
      msIntoSlot: 0,
    });
  }

  @computed get currentTime(): ?CurrentTimeRequests {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return undefined;

    return this.getCurrentTimeRequests(publicDeriver.publicDeriverId);
  }
}
