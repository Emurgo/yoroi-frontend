// @flow

import type { ConfigType } from '../../../../../../config/config-types';

declare var CONFIG: ConfigType;

export type ToAbsoluteSlotNumberRequest = {|
  epoch: number,
  slot: number,
|};
export type ToAbsoluteSlotNumberResponse = number;
export type ToAbsoluteSlotNumberFunc = (
  request: ToAbsoluteSlotNumberRequest
) => ToAbsoluteSlotNumberResponse;

export async function genToAbsoluteSlotNumber(): Promise<ToAbsoluteSlotNumberFunc> {
  // TODO: Cardano in the future will have a variable epoch size
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (request: ToAbsoluteSlotNumberRequest) => {
    return (CONFIG.genesis.slots_per_epoch * request.epoch) + request.slot;
  };
}

export type ToRelativeSlotNumberRequest = ToAbsoluteSlotNumberResponse;
export type ToRelativeSlotNumberResponse = ToAbsoluteSlotNumberRequest;
export type ToRelativeSlotNumberFunc = (
  request: ToRelativeSlotNumberRequest
) => ToRelativeSlotNumberResponse;
export async function genToRelativeSlotNumber(): Promise<ToRelativeSlotNumberFunc> {
  // TODO: Cardano in the future will have a variable epoch size
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (absoluteSlot: ToRelativeSlotNumberRequest) => {
    const epoch = Math.floor(absoluteSlot / CONFIG.genesis.slots_per_epoch);
    const slot = absoluteSlot % CONFIG.genesis.slots_per_epoch;
    return {
      epoch,
      slot,
    };
  };
}

export type TimeToAbsoluteSlotRequest = {|
  time: Date,
|};
export type TimeToAbsoluteSlotResponse = {|
  slot: number,
  msIntoSlot: number
|};
export type TimeToAbsoluteSlotFunc = (
  request: TimeToAbsoluteSlotRequest
) => TimeToAbsoluteSlotResponse;
export async function genTimeToSlot(): Promise<TimeToAbsoluteSlotFunc> {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (request: TimeToAbsoluteSlotRequest) => {
    const timeSinceGenesis = request.time.getTime() - CONFIG.genesis.block0_date;
    const secondsSinceGenesis = timeSinceGenesis / 1000;
    const totalSlots = Math.floor(secondsSinceGenesis / CONFIG.genesis.slot_duration);

    const msIntoSlot = timeSinceGenesis % 1000;
    const secondsIntoSlot = secondsSinceGenesis % CONFIG.genesis.slot_duration;
    return {
      slot: totalSlots,
      msIntoSlot: (1000 * secondsIntoSlot) + msIntoSlot,
    };
  };
}

export type CurrentEpochLengthRequest = void;
export type CurrentEpochLengthResponse = number;
export type CurrentEpochLengthFunc = (
  request: CurrentEpochLengthRequest
) => CurrentEpochLengthResponse;
export async function genCurrentEpochLength(): Promise<CurrentEpochLengthFunc> {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (_request: CurrentEpochLengthRequest) => {
    return CONFIG.genesis.slots_per_epoch;
  };
}

export type CurrentSlotLengthRequest = void;
export type CurrentSlotLengthResponse = number;
export type CurrentSlotLengthFunc = (
  request: CurrentSlotLengthRequest
) => CurrentSlotLengthResponse;
export async function genCurrentSlotLength(): Promise<CurrentSlotLengthFunc> {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (_request: CurrentSlotLengthRequest) => {
    return CONFIG.genesis.slot_duration;
  };
}

export type TimeSinceGenesisRequest = {|
  absoluteSlot: number,
|};
export type TimeSinceGenesisResponse = number;
export type TimeSinceGenesisRequestFunc = (
  request: TimeSinceGenesisRequest
) => TimeSinceGenesisResponse;
export async function genTimeSinceGenesis(): Promise<TimeSinceGenesisRequestFunc> {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (request: TimeSinceGenesisRequest) => {
    return (CONFIG.genesis.slot_duration * request.absoluteSlot);
  };
}
