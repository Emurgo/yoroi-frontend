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
} from '../../api/jormungandr/lib/storage/bridge/timeUtils';
import type {
  ToAbsoluteSlotNumberFunc,
  ToRelativeSlotNumberFunc,
  TimeToAbsoluteSlotFunc,
  CurrentEpochLengthFunc,
  CurrentSlotLengthFunc,
  TimeSinceGenesisFunc,
  ToRealTimeFunc,
} from '../../api/common/lib/storage/bridge/timeUtils';
import {
  buildCheckAndCall,
} from '../lib/check';
import { getApiForNetwork, ApiOptions } from '../../api/common/utils';
import type { CurrentTimeRequests } from '../base/BaseCardanoTimeStore';
import { isJormungandr, getJormungandrBaseConfig, } from '../../api/ada/lib/storage/database/prepackaged/networks';

/**
 * Different wallets can be on different networks and therefore have different measures of time
*/
export default class JormungandrTimeStore extends BaseCardanoTimeStore {

  setup(): void {
    super.setup();
    const { asyncCheck } = buildCheckAndCall(
      ApiOptions.jormungandr,
      () => {
        if (this.stores.profile.selectedNetwork == null) return undefined;
        return getApiForNetwork(this.stores.profile.selectedNetwork);
      }
    );
    this.actions.time.tick.listen(asyncCheck(this._updateTime));
  }

  @action addObservedTime: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    this.timeCalcRequests.push({
      publicDeriver,
      requests: {
        toAbsoluteSlot: new CachedRequest<void => Promise<ToAbsoluteSlotNumberFunc>>(
          () => genToAbsoluteSlotNumber(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        toRelativeSlotNumber: new CachedRequest<void => Promise<ToRelativeSlotNumberFunc>>(
          () => genToRelativeSlotNumber(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        timeToSlot: new CachedRequest<void => Promise<TimeToAbsoluteSlotFunc>>(
          () => genTimeToSlot(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        currentEpochLength: new CachedRequest<void => Promise<CurrentEpochLengthFunc>>(
          () => genCurrentEpochLength(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        currentSlotLength: new CachedRequest<void => Promise<CurrentSlotLengthFunc>>(
          () => genCurrentSlotLength(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        timeSinceGenesis: new CachedRequest<void => Promise<TimeSinceGenesisFunc>>(
          () => genTimeSinceGenesis(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          )
        ),
        toRealTime: new CachedRequest<void => Promise<ToRealTimeFunc>>(
          () => genToRealTime(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
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
    if (!isJormungandr(publicDeriver.getParent().getNetworkInfo())) return undefined;

    return this.getCurrentTimeRequests(publicDeriver);
  }
}
