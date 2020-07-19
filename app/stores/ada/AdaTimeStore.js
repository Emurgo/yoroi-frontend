// @flow

import { action, } from 'mobx';
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
  TimeSinceGenesisRequestFunc,
  ToRealTimeFunc,
} from '../../api/ada/lib/storage/bridge/timeUtils';
import {
  buildCheckAndCall,
} from '../lib/check';
import { getApiForNetwork, ApiOptions } from '../../api/common/utils';

/**
 * Different wallets can be on different networks and therefore have different measures of time
*/
export default class AdaTimeStore extends BaseCardanoTimeStore {

  setup(): void {
    super.setup();
    const { asyncCheck } = buildCheckAndCall(
      ApiOptions.ada,
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
}
