// @flow

import { action, computed, observable, runInAction, } from 'mobx';
import { find } from 'lodash';
import Store from './Store';
import type { StoresMap } from '../index';
import type { RelativeSlot } from '../../api/ada/lib/storage/bridge/timeUtils';
import TimeUtils from '../../api/ada/lib/storage/bridge/timeUtils';
import {
  getCardanoHaskellBaseConfig,
  getNetworkById,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { fail, maybe } from '../../coreUtils';

export type TimeCalcRequests = {|
  // although time is network-specific
  // time settings can change over duration of blockchain
  // so it depends how much the blockchain has synced for a given wallet
  publicDeriverId: number,
  requests: {|
    toAbsoluteSlot: RelativeSlot => number;
    toRelativeSlotNumber: number => RelativeSlot;
    timeToSlot: {| time: Date |} => {| slot: number |};
    currentEpochLength: () => number;
    currentSlotLength: () => number;
    toRealTime: {| absoluteSlotNum: number |} => Date;
  |},
|};

export type CurrentTimeRequests = {|
  // although time is network-specific
  // time settings can change over duration of blockchain
  // so it depends how much the blockchain has synced for a given wallet
  publicDeriverId: number,
  currentEpoch: number,
  currentSlot: number,
|};

/**
 * Different wallets can be on different networks and therefore have different measures of time
*/
export default class BaseCardanoTimeStore extends Store<StoresMap> {

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

  @action addObservedTime: { publicDeriverId: number, networkId: number, ... }  => void = (
    wallet
  ) => {
    const baseConfig = getCardanoHaskellBaseConfig(getNetworkById(wallet.networkId));
    this.timeCalcRequests.push({
      publicDeriverId: wallet.publicDeriverId,
      requests: {
        toAbsoluteSlot: (relativeSlot: RelativeSlot) => TimeUtils.toAbsoluteSlotNumber(baseConfig, relativeSlot),
        toRelativeSlotNumber: absoluteSlot => TimeUtils.toRelativeSlotNumber(baseConfig, absoluteSlot),
        timeToSlot: (req: {| time: Date |}) => ({ slot: TimeUtils.timeToAbsoluteSlot(baseConfig, req.time) }),
        currentEpochLength: () => TimeUtils.currentEpochSlots(baseConfig),
        currentSlotLength: () => TimeUtils.currentSlotSeconds(baseConfig),
        toRealTime: (req: {| absoluteSlotNum: number |}) => TimeUtils.absoluteSlotToTime(baseConfig, req.absoluteSlotNum),
      },
    });
    this.currentTimeRequests.push({
      publicDeriverId: wallet.publicDeriverId,
      // initial values that can be updated later
      currentEpoch: 0,
      currentSlot: 0,
    });
  }

  getTimeCalcRequests: ({ publicDeriverId: number, ... })=> TimeCalcRequests = ({ publicDeriverId }) => {
    return find(this.timeCalcRequests, { publicDeriverId })
      ?? fail(`${nameof(this.getTimeCalcRequests)} missing for public deriver`);
  }

  getCurrentTimeRequests: ({ publicDeriverId: number, ... }) => CurrentTimeRequests = ({ publicDeriverId }) => {
    return find(this.currentTimeRequests, { publicDeriverId })
      ?? fail(`${nameof(this.getCurrentTimeRequests)} missing for public deriver`)
  }

  @computed get currentTime(): ?CurrentTimeRequests {
    return maybe(this.stores.wallets.selected, w => this.getCurrentTimeRequests(w));
  }

  @action _updateTime: void => Promise<void> = async () => {
    const currTime = new Date();
    runInAction(() => { this.time = currTime; });

    const selected = this.stores.wallets.selected;
    if (selected == null) return;

    const timeCalcRequests = this.getTimeCalcRequests(selected);
    const currTimeRequests = this.getCurrentTimeRequests(selected);

    const { timeToSlot, toRelativeSlotNumber } = timeCalcRequests.requests;

    const currentAbsoluteSlot = timeToSlot({ time: currTime });
    const currentRelativeTime = toRelativeSlotNumber(currentAbsoluteSlot.slot);

    runInAction(() => {
      if (currTimeRequests.currentEpoch !== currentRelativeTime.epoch) {
        // Clearing processed withdrawals in case epoch changes
        this.stores.transactions.clearProcessedWithdrawals(selected);
        currTimeRequests.currentEpoch = currentRelativeTime.epoch;
      }
      currTimeRequests.currentSlot = currentRelativeTime.slot;
    });
  }
}
