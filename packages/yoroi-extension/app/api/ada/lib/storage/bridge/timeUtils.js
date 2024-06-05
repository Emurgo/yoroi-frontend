// @flow

import type { CardanoHaskellConfig } from '../database/primitives/tables';
import { fail } from '../../../../../coreUtils';

export type RelativeSlot = {| epoch: number, slot: number |};

export default class TimeUtils {

  static toAbsoluteSlotNumber(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
    relativeSlot: RelativeSlot,
  ): number {
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let slotCount = 0;
    let epochsLeft = relativeSlot.epoch;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt ?? fail(`${nameof(TimeUtils.toAbsoluteSlotNumber)} missing start`);
      const end = config[i + 1].StartAt ?? fail(`${nameof(TimeUtils.toAbsoluteSlotNumber)} missing end`);

      // queried time is before the next protocol parameter choice
      if (end > relativeSlot.epoch) {
        break;
      }
      const numEpochs = end - start;

      if (SlotsPerEpoch == null) throw new Error(`${nameof(TimeUtils.toAbsoluteSlotNumber)} missing params`);
      slotCount += SlotsPerEpoch * numEpochs;
      epochsLeft -= numEpochs;

      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch;
    }
    if (SlotsPerEpoch == null) throw new Error(`${nameof(TimeUtils.toAbsoluteSlotNumber)} missing params`);
    // find how many slots in the epochs since the last update
    const slotsLeft = SlotsPerEpoch * epochsLeft;
    return slotCount + slotsLeft + relativeSlot.slot;
  }

  static toRelativeSlotNumber(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
    absoluteSlot: number,
  ): RelativeSlot {
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let epochCount = 0;
    let slotsLeft = absoluteSlot;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt ?? fail(`${nameof(TimeUtils.toRelativeSlotNumber)} missing start`);
      const end = config[i + 1].StartAt ?? fail(`${nameof(TimeUtils.toRelativeSlotNumber)} missing end`);
      const numEpochs = end - start;

      if (SlotsPerEpoch == null) throw new Error(`${nameof(TimeUtils.toRelativeSlotNumber)} missing params`);

      // queried time is before the next protocol parameter choice
      if (slotsLeft < SlotsPerEpoch * numEpochs) {
        break;
      }

      slotsLeft -= SlotsPerEpoch * numEpochs;
      epochCount += numEpochs;

      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch;
    }

    if (SlotsPerEpoch == null) throw new Error(`${nameof(TimeUtils.toRelativeSlotNumber)} missing params`);

    // find how many slots in the epochs since the last update
    epochCount += Math.floor(slotsLeft / SlotsPerEpoch);

    return {
      epoch: epochCount,
      slot: slotsLeft % SlotsPerEpoch,
    };
  }

  static secondsSinceGenesis(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
    absoluteSlotNum: number,
  ): number {
    let SlotDuration = config[0].SlotDuration;
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let time = 0;
    let slotsLeft = absoluteSlotNum;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt ?? fail(`${nameof(TimeUtils.secondsSinceGenesis)} missing start`);
      const end = config[i + 1].StartAt ?? fail(`${nameof(TimeUtils.secondsSinceGenesis)} missing end`);
      const numEpochs = end - start;

      if (SlotDuration == null || SlotsPerEpoch == null) throw new Error(`${nameof(TimeUtils.secondsSinceGenesis)} missing params`);

      // queried time is before the next protocol parameter choice
      if (slotsLeft < SlotsPerEpoch * numEpochs) {
        break;
      }
      time += (SlotsPerEpoch * SlotDuration) * numEpochs;
      slotsLeft -= SlotsPerEpoch * numEpochs;

      SlotDuration = config[i + 1].SlotDuration ?? SlotDuration;
      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch;
    }

    if (SlotDuration == null || SlotsPerEpoch == null) throw new Error(`${nameof(TimeUtils.secondsSinceGenesis)} missing params`);

    // add seconds into the current update
    time += slotsLeft * SlotDuration;

    return time;
  }

  static timeToAbsoluteSlot(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
    time: Date,
  ): number {
    const { GenesisDate, } = config[0];
    if (GenesisDate == null) throw new Error(`${nameof(TimeUtils.timeToAbsoluteSlot)} missing genesis params`);
    let SlotDuration = config[0].SlotDuration;
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let timeLeftToTip = (time.getTime() - new Date(Number.parseInt(GenesisDate, 10)).getTime());
    let slotCount = 0;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt ?? fail(`${nameof(TimeUtils.timeToAbsoluteSlot)} missing start`);
      const end = config[i + 1].StartAt ?? fail(`${nameof(TimeUtils.timeToAbsoluteSlot)} missing end`);
      const numEpochs = end - start;

      if (SlotDuration == null || SlotsPerEpoch == null) throw new Error(`${nameof(TimeUtils.timeToAbsoluteSlot)} missing params`);

      // queried time is before the next protocol parameter choice
      if (timeLeftToTip < (SlotsPerEpoch * SlotDuration * 1000) * numEpochs) {
        break;
      }
      slotCount += SlotsPerEpoch * numEpochs;
      timeLeftToTip -= (SlotsPerEpoch * SlotDuration * 1000) * numEpochs;

      SlotDuration = config[i + 1].SlotDuration ?? SlotDuration;
      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch;
    }

    if (SlotDuration == null || SlotsPerEpoch == null) throw new Error(`${nameof(TimeUtils.timeToAbsoluteSlot)} missing params`);

    // find how many slots since the last update
    const secondsSinceLastUpdate = timeLeftToTip / 1000;
    slotCount += Math.floor(secondsSinceLastUpdate / SlotDuration);

    // const msIntoSlot = timeLeftToTip % 1000;
    // const secondsIntoSlot = secondsSinceLastUpdate % SlotDuration;
    return slotCount;
  }

  static absoluteSlotToTime(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
    absoluteSlotNum: number,
  ): Date {
    const { GenesisDate } = config[0];
    if (GenesisDate == null) throw new Error(`${nameof(TimeUtils.absoluteSlotToTime)} missing genesis start date`);
    const secondsSinceGenesis = TimeUtils.secondsSinceGenesis(config, absoluteSlotNum);
    const time = (new Date(Number.parseInt(GenesisDate, 10)).getTime() + (1000 * secondsSinceGenesis));
    return new Date(time);
  }

  static currentEpochSlots(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
  ): number {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {});
    return finalConfig.SlotsPerEpoch;
  }

  static currentSlotSeconds(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
  ): number {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {});
    return finalConfig.SlotDuration;
  }
}
