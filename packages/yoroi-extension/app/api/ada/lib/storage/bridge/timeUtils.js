// @flow

import type { CardanoHaskellConfig } from '../database/primitives/tables';

export type ToAbsoluteSlotNumberFunc = {| epoch: number, slot: number |} => number;

export function genToAbsoluteSlotNumber(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): ToAbsoluteSlotNumberFunc {
  return request => {
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let slotCount = 0;
    let epochsLeft = request.epoch;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt ?? (() => { throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing start`); })();
      const end = config[i + 1].StartAt ?? (() => { throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing end`); })();

      // queried time is before the next protocol parameter choice
      if (end > request.epoch) {
        break;
      }
      const numEpochs = end - start;

      if (SlotsPerEpoch == null) throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing params`);
      slotCount += SlotsPerEpoch * numEpochs;
      epochsLeft -= numEpochs;

      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch;
    }

    if (SlotsPerEpoch == null) throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing params`);

    // find how many slots in the epochs since the last update
    slotCount += SlotsPerEpoch * epochsLeft;

    return slotCount + request.slot;
  };
}

export type ToRelativeSlotNumberFunc = number => {| epoch: number, slot: number |};

export function genToRelativeSlotNumber(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): ToRelativeSlotNumberFunc {
  return absoluteSlot => {
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let epochCount = 0;
    let slotsLeft = absoluteSlot;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt ?? (() => { throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing start`); })();
      const end = config[i + 1].StartAt ?? (() => { throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing end`); })();
      const numEpochs = end - start;

      if (SlotsPerEpoch == null) throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing params`);

      // queried time is before the next protocol parameter choice
      if (slotsLeft < SlotsPerEpoch * numEpochs) {
        break;
      }

      slotsLeft -= SlotsPerEpoch * numEpochs;
      epochCount += numEpochs;

      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch;
    }

    if (SlotsPerEpoch == null) throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing params`);

    // find how many slots in the epochs since the last update
    epochCount += Math.floor(slotsLeft / SlotsPerEpoch);

    return {
      epoch: epochCount,
      slot: slotsLeft % SlotsPerEpoch,
    };
  };
}

export type TimeToAbsoluteSlotFunc = {| time: Date |} => {| slot: number, msIntoSlot: number |};

export function genTimeToSlot(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): TimeToAbsoluteSlotFunc {
  return request => {
    const { GenesisDate, } = config[0];
    if (GenesisDate == null) throw new Error(`${nameof(genTimeToSlot)} missing genesis params`);
    let SlotDuration = config[0].SlotDuration;
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let timeLeftToTip = (
      request.time.getTime() - new Date(Number.parseInt(GenesisDate, 10)).getTime()
    );
    let slotCount = 0;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt ?? (() => { throw new Error(`${nameof(genTimeToSlot)} missing start`); })();
      const end = config[i + 1].StartAt ?? (() => { throw new Error(`${nameof(genTimeToSlot)} missing end`); })();
      const numEpochs = end - start;

      if (SlotDuration == null || SlotsPerEpoch == null) throw new Error(`${nameof(genTimeToSlot)} missing params`);

      // queried time is before the next protocol parameter choice
      if (timeLeftToTip < (SlotsPerEpoch * SlotDuration * 1000) * numEpochs) {
        break;
      }
      slotCount += SlotsPerEpoch * numEpochs;
      timeLeftToTip -= (SlotsPerEpoch * SlotDuration * 1000) * numEpochs;

      SlotDuration = config[i + 1].SlotDuration ?? SlotDuration;
      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch;
    }

    if (SlotDuration == null || SlotsPerEpoch == null) throw new Error(`${nameof(genTimeToSlot)} missing params`);

    // find how many slots since the last update
    const secondsSinceLastUpdate = timeLeftToTip / 1000;
    slotCount += Math.floor(secondsSinceLastUpdate / SlotDuration);

    const msIntoSlot = timeLeftToTip % 1000;
    const secondsIntoSlot = secondsSinceLastUpdate % SlotDuration;
    return {
      slot: slotCount,
      msIntoSlot: (1000 * secondsIntoSlot) + msIntoSlot,
    };
  };
}

export type CurrentEpochLengthFunc = () => number; /** slots per epoch */

export function genCurrentEpochLength(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): CurrentEpochLengthFunc {
  return () => {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {});
    return finalConfig.SlotsPerEpoch;
  };
}

export type CurrentSlotLengthFunc = () => number;

export function genCurrentSlotLength(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): CurrentSlotLengthFunc {
  return () => {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {});
    return finalConfig.SlotDuration;
  };
}

export type TimeSinceGenesisFunc = {| absoluteSlotNum: number |} => number; /* seconds */

export function genTimeSinceGenesis(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): TimeSinceGenesisFunc {
  return request => {
    let SlotDuration = config[0].SlotDuration;
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let time = 0;
    let slotsLeft = request.absoluteSlotNum;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt ?? (() => { throw new Error(`${nameof(genTimeSinceGenesis)} missing start`); })();
      const end = config[i + 1].StartAt ?? (() => { throw new Error(`${nameof(genTimeSinceGenesis)} missing end`); })();
      const numEpochs = end - start;

      if (SlotDuration == null || SlotsPerEpoch == null) throw new Error(`${nameof(genTimeSinceGenesis)} missing params`);

      // queried time is before the next protocol parameter choice
      if (slotsLeft < SlotsPerEpoch * numEpochs) {
        break;
      }
      time += (SlotsPerEpoch * SlotDuration) * numEpochs;
      slotsLeft -= SlotsPerEpoch * numEpochs;

      SlotDuration = config[i + 1].SlotDuration ?? SlotDuration;
      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch;
    }

    if (SlotDuration == null || SlotsPerEpoch == null) throw new Error(`${nameof(genTimeSinceGenesis)} missing params`);

    // add seconds into the current update
    time += slotsLeft * SlotDuration;

    return time;
  };
}

export type ToRealTimeFunc = {| absoluteSlotNum: number, timeSinceGenesisFunc: TimeSinceGenesisFunc |} => Date;

export function genToRealTime(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): ToRealTimeFunc {
  return request => {
    const { GenesisDate } = config[0];
    if (GenesisDate == null) throw new Error(`${nameof(genToRealTime)} missing genesis start date`);
    const secondsSinceGenesis = request.timeSinceGenesisFunc({
      absoluteSlotNum: request.absoluteSlotNum,
    });
    const time = (new Date(Number.parseInt(GenesisDate, 10)).getTime() + (1000 * secondsSinceGenesis));
    return new Date(time);
  };
}
