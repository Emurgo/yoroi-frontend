// @flow

import type { CardanoHaskellConfig } from '../database/primitives/tables';
import { fail } from '../../../../../coreUtils';
import { cardanoHaskellConfigCombine } from '../database/prepackaged/networks';

export type RelativeSlot = {| epoch: number, slot: number |};

/**
 * @return {Array<[startEpoch: number, endEpoch: number, nextConfig: CardanoHaskellConfig]>}
 */
function createEraBoundaries(config: $ReadOnlyArray<CardanoHaskellConfig>): Array<[number, number, CardanoHaskellConfig]> {
  const res: Array<[number, number, CardanoHaskellConfig]> = [];
  for (let i = 0; i < config.length - 2; i++) {
    res.push([
      config[i].StartAt ?? fail(`${nameof(createEraBoundaries)} missing start`),
      config[i + 1].StartAt ?? fail(`${nameof(createEraBoundaries)} missing end`),
      config[i + 1],
    ]);
  }
  return res;
}

export default class TimeUtils {

  static toAbsoluteSlotNumber(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
    relativeSlot: RelativeSlot,
  ): number {
    let SlotsPerEpoch = config[0].SlotsPerEpoch ?? fail(`${nameof(TimeUtils.toAbsoluteSlotNumber)} missing slots per epoch`);
    let slotCount = 0;
    let epochsLeft = relativeSlot.epoch;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (const [startEpoch, endEpoch, nextConfig] of createEraBoundaries(config)) {

      // queried time is before the next protocol parameter choice
      if (endEpoch > relativeSlot.epoch) {
        break;
      }

      const numEpochs = endEpoch - startEpoch;

      slotCount += SlotsPerEpoch * numEpochs;
      epochsLeft -= numEpochs;

      SlotsPerEpoch = nextConfig.SlotsPerEpoch ?? SlotsPerEpoch;
    }
    // find how many slots in the epochs since the last update
    const slotsLeft = SlotsPerEpoch * epochsLeft;
    return slotCount + slotsLeft + relativeSlot.slot;
  }

  static toRelativeSlotNumber(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
    absoluteSlot: number,
  ): RelativeSlot {
    let SlotsPerEpoch = config[0].SlotsPerEpoch ?? fail(`${nameof(TimeUtils.toRelativeSlotNumber)} missing slots per epoch`);
    let epochCount = 0;
    let slotsLeft = absoluteSlot;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (const [startEpoch, endEpoch, nextConfig] of createEraBoundaries(config)) {

      const numEpochs = endEpoch - startEpoch;

      // queried time is before the next protocol parameter choice
      if (slotsLeft < SlotsPerEpoch * numEpochs) {
        break;
      }

      slotsLeft -= SlotsPerEpoch * numEpochs;
      epochCount += numEpochs;

      SlotsPerEpoch = nextConfig.SlotsPerEpoch ?? SlotsPerEpoch;
    }
    // find how many slots in the epochs since the last update
    return {
      epoch: epochCount + Math.floor(slotsLeft / SlotsPerEpoch),
      slot: slotsLeft % SlotsPerEpoch,
    };
  }

  static timeToAbsoluteSlot(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
    time: Date,
  ): number {
    const GenesisDate = config[0].GenesisDate ?? fail(`${nameof(TimeUtils.timeToAbsoluteSlot)} missing genesis date`);
    let SlotDuration = config[0].SlotDuration ?? fail(`${nameof(TimeUtils.timeToAbsoluteSlot)} missing slot duration`);
    let SlotsPerEpoch = config[0].SlotsPerEpoch ?? fail(`${nameof(TimeUtils.timeToAbsoluteSlot)} missing slots per epoch`);
    let timeLeftToTip = (time.getTime() - new Date(Number.parseInt(GenesisDate, 10)).getTime());
    let slotCount = 0;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (const [startEpoch, endEpoch, nextConfig] of createEraBoundaries(config)) {

      const numEpochs = endEpoch - startEpoch;

      // queried time is before the next protocol parameter choice
      if (timeLeftToTip < (SlotsPerEpoch * SlotDuration * 1000) * numEpochs) {
        break;
      }

      slotCount += SlotsPerEpoch * numEpochs;
      timeLeftToTip -= (SlotsPerEpoch * SlotDuration * 1000) * numEpochs;

      SlotDuration = nextConfig.SlotDuration ?? SlotDuration;
      SlotsPerEpoch = nextConfig.SlotsPerEpoch ?? SlotsPerEpoch;
    }
    // find how many slots since the last update
    const secondsSinceLastUpdate = timeLeftToTip / 1000;
    return slotCount + Math.floor(secondsSinceLastUpdate / SlotDuration);
  }

  static secondsSinceGenesis(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
    absoluteSlotNum: number,
  ): number {
    let SlotDuration = config[0].SlotDuration ?? fail(`${nameof(TimeUtils.secondsSinceGenesis)} missing slot duration`);
    let SlotsPerEpoch = config[0].SlotsPerEpoch ?? fail(`${nameof(TimeUtils.secondsSinceGenesis)} missing slots per epoch`);
    let time = 0;
    let slotsLeft = absoluteSlotNum;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (const [startEpoch, endEpoch, nextConfig] of createEraBoundaries(config)) {

      const numEpochs = endEpoch - startEpoch;

      // queried time is before the next protocol parameter choice
      if (slotsLeft < SlotsPerEpoch * numEpochs) {
        break;
      }

      time += (SlotsPerEpoch * SlotDuration) * numEpochs;
      slotsLeft -= SlotsPerEpoch * numEpochs;

      SlotDuration = nextConfig.SlotDuration ?? SlotDuration;
      SlotsPerEpoch = nextConfig.SlotsPerEpoch ?? SlotsPerEpoch;
    }
    // add seconds into the current update
    return time + (slotsLeft * SlotDuration);
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
    return cardanoHaskellConfigCombine(config).SlotsPerEpoch
      ?? fail(`${nameof(TimeUtils.currentEpochSlots)} missing slots per epoch`);
  }

  static currentSlotSeconds(
    config: $ReadOnlyArray<CardanoHaskellConfig>,
  ): number {
    return cardanoHaskellConfigCombine(config).SlotDuration
      ?? fail(`${nameof(TimeUtils.currentSlotSeconds)} missing slot duration`);
  }
}
