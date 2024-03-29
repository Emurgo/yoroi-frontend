// @flow

import { action, computed, } from 'mobx';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
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
import { isCardanoHaskell, getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';

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

  @action addObservedTime: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    this.timeCalcRequests.push({
      publicDeriver,
      requests: {
        toAbsoluteSlot: new CachedRequest<void => Promise<ToAbsoluteSlotNumberFunc>>(
          () => genToAbsoluteSlotNumber(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        toRelativeSlotNumber: new CachedRequest<void => Promise<ToRelativeSlotNumberFunc>>(
          () => genToRelativeSlotNumber(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        timeToSlot: new CachedRequest<void => Promise<TimeToAbsoluteSlotFunc>>(
          () => genTimeToSlot(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        currentEpochLength: new CachedRequest<void => Promise<CurrentEpochLengthFunc>>(
          () => genCurrentEpochLength(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        currentSlotLength: new CachedRequest<void => Promise<CurrentSlotLengthFunc>>(
          () => genCurrentSlotLength(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        timeSinceGenesis: new CachedRequest<void => Promise<TimeSinceGenesisFunc>>(
          () => genTimeSinceGenesis(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        toRealTime: new CachedRequest<void => Promise<ToRealTimeFunc>>(
          () => genToRealTime(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
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

  @computed get currentTime(): ?CurrentTimeRequests {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return undefined;
    if (!isCardanoHaskell(publicDeriver.getParent().getNetworkInfo())) return undefined;

    return this.getCurrentTimeRequests(publicDeriver);
  }
}
