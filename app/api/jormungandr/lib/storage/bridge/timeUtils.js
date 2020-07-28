// @flow

import type { JormungandrConfig } from '../../../../ada/lib/storage/database/primitives/tables';

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
  config: $ReadOnlyArray<JormungandrConfig>,
): Promise<ToAbsoluteSlotNumberFunc> {
  return baseGenToAbsoluteSlotNumber(config);
}

export async function genToRelativeSlotNumber(
  config: $ReadOnlyArray<JormungandrConfig>,
): Promise<ToRelativeSlotNumberFunc> {
  return baseGenToRelativeSlotNumber(config);
}

export async function genTimeToSlot(
  config: $ReadOnlyArray<JormungandrConfig>,
): Promise<TimeToAbsoluteSlotFunc> {
  return baseGenTimeToSlot(config);
}

export async function genCurrentEpochLength(
  config: $ReadOnlyArray<JormungandrConfig>,
): Promise<CurrentEpochLengthFunc> {
  return baseGenCurrentEpochLength(config);
}

export async function genCurrentSlotLength(
  config: $ReadOnlyArray<JormungandrConfig>,
): Promise<CurrentSlotLengthFunc> {
  return baseGenCurrentSlotLength(config);
}

export async function genTimeSinceGenesis(
  config: $ReadOnlyArray<JormungandrConfig>,
): Promise<TimeSinceGenesisFunc> {
  return baseGenTimeSinceGenesis(config);
}

export async function genToRealTime(
  config: $ReadOnlyArray<JormungandrConfig>,
): Promise<ToRealTimeFunc> {
  return baseGenToRealTime(config);
}
