// @flow

import type { CardanoHaskellConfig } from '../database/primitives/tables';

import {
  genTimeToSlot as baseGenTimeToSlot,
  genCurrentEpochLength as baseGenCurrentEpochLength,
  genCurrentSlotLength as baseGenCurrentSlotLength,
  genTimeSinceGenesis as baseGenTimeSinceGenesis,
  genToRealTime as baseGenToRealTime,
  genToRelativeSlotNumber as baseGenToRelativeSlotNumber,
  genToAbsoluteSlotNumber as baseGenToAbsoluteSlotNumber,
} from '../../../../common/lib/storage/bridge/timeUtils';
import type {
  TimeToAbsoluteSlotFunc,
  CurrentSlotLengthFunc,
  CurrentEpochLengthFunc,
  TimeSinceGenesisFunc,
  ToRealTimeFunc,
  ToRelativeSlotNumberFunc,
  ToAbsoluteSlotNumberFunc,
} from '../../../../common/lib/storage/bridge/timeUtils';

export async function genToAbsoluteSlotNumber(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): Promise<ToAbsoluteSlotNumberFunc> {
  return baseGenToAbsoluteSlotNumber(config);
}

export async function genToRelativeSlotNumber(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): Promise<ToRelativeSlotNumberFunc> {
  return baseGenToRelativeSlotNumber(config);
}

export async function genTimeToSlot(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): Promise<TimeToAbsoluteSlotFunc> {
  return baseGenTimeToSlot(config);
}

export async function genCurrentEpochLength(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): Promise<CurrentEpochLengthFunc> {
  return baseGenCurrentEpochLength(config);
}

export async function genCurrentSlotLength(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): Promise<CurrentSlotLengthFunc> {
  return baseGenCurrentSlotLength(config);
}

export async function genTimeSinceGenesis(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): Promise<TimeSinceGenesisFunc> {
  return baseGenTimeSinceGenesis(config);
}

export async function genToRealTime(
  config: $ReadOnlyArray<CardanoHaskellConfig>,
): Promise<ToRealTimeFunc> {
  return baseGenToRealTime(config);
}
