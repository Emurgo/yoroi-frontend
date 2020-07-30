// @flow

export type ToAbsoluteSlotNumberRequest = {|
  epoch: number,
  slot: number,
|};
export type ToAbsoluteSlotNumberResponse = number;
export type ToAbsoluteSlotNumberFunc = (
  request: ToAbsoluteSlotNumberRequest
) => ToAbsoluteSlotNumberResponse;

export async function genToAbsoluteSlotNumber(
  config: $ReadOnlyArray<$ReadOnly<{
    StartAt?: number,
    SlotsPerEpoch?: number,
    ...,
  }>>,
): Promise<ToAbsoluteSlotNumberFunc> {
  return (request: ToAbsoluteSlotNumberRequest) => {
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


export type ToRelativeSlotNumberRequest = ToAbsoluteSlotNumberResponse;
export type ToRelativeSlotNumberResponse = ToAbsoluteSlotNumberRequest;
export type ToRelativeSlotNumberFunc = (
  request: ToRelativeSlotNumberRequest
) => ToRelativeSlotNumberResponse;
export async function genToRelativeSlotNumber(
  config: $ReadOnlyArray<$ReadOnly<{
    StartAt?: number,
    SlotsPerEpoch?: number,
    ...,
  }>>,
): Promise<ToRelativeSlotNumberFunc> {
  return (absoluteSlot: ToRelativeSlotNumberRequest) => {
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let epochCount = 0;
    let slotsLeft = absoluteSlot;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt ?? (() => { throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing start`); })();
      const end = config[i + 1].StartAt ?? (() => { throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing end`); })();
      const numEpochs = end - start;

      if (SlotsPerEpoch == null) throw new Error(`${nameof(genToAbsoluteSlotNumber)} missing params`);
      slotsLeft -= SlotsPerEpoch * numEpochs;

      // queried time is before the next protocol parameter choice
      if (slotsLeft < 0) {
        break;
      }
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

export type TimeToAbsoluteSlotRequest = {|
  time: Date,
|};
export type TimeToAbsoluteSlotResponse = {|
  slot: number,
  msIntoSlot: number
|};
export type TimeToAbsoluteSlotFunc = (
  request: TimeToAbsoluteSlotRequest,
) => TimeToAbsoluteSlotResponse;

export async function genTimeToSlot(
  config: $ReadOnlyArray<$ReadOnly<{
    StartAt?: number,
    GenesisDate?: string,
    SlotsPerEpoch?: number,
    SlotDuration?: number,
    ...,
  }>>,
): Promise<TimeToAbsoluteSlotFunc> {
  return (request: TimeToAbsoluteSlotRequest) => {
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

export type CurrentEpochLengthRequest = void;
/** slots per epoch */
export type CurrentEpochLengthResponse = number;
export type CurrentEpochLengthFunc = (
  request: CurrentEpochLengthRequest
) => CurrentEpochLengthResponse;
export async function genCurrentEpochLength(
  config: $ReadOnlyArray<$ReadOnly<{
    SlotsPerEpoch?: number,
    ...,
  }>>,
): Promise<CurrentEpochLengthFunc> {
  return (_request: CurrentEpochLengthRequest) => {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {});
    return finalConfig.SlotsPerEpoch;
  };
}

export type CurrentSlotLengthRequest = void;
export type CurrentSlotLengthResponse = number;
export type CurrentSlotLengthFunc = (
  request: CurrentSlotLengthRequest
) => CurrentSlotLengthResponse;
export async function genCurrentSlotLength(
  config: $ReadOnlyArray<$ReadOnly<{
    SlotDuration?: number,
    ...,
  }>>,
): Promise<CurrentSlotLengthFunc> {
  return (_request: CurrentSlotLengthRequest) => {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {});
    return finalConfig.SlotDuration;
  };
}

export type TimeSinceGenesisRequest = {|
  absoluteSlotNum: number,
|};
export type TimeSinceGenesisResponse = number; /* seconds */
export type TimeSinceGenesisFunc = (
  request: TimeSinceGenesisRequest
) => TimeSinceGenesisResponse;
export async function genTimeSinceGenesis(
  config: $ReadOnlyArray<$ReadOnly<{
    StartAt?: number,
    GenesisDate?: string,
    SlotsPerEpoch?: number,
    SlotDuration?: number,
    ...,
  }>>,
): Promise<TimeSinceGenesisFunc> {
  return (request: TimeSinceGenesisRequest) => {
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

export type ToRealTimeRequest = {|
  absoluteSlotNum: number,
  timeSinceGenesisFunc: TimeSinceGenesisFunc,
|};
export type ToRealTimeResponse = Date;
export type ToRealTimeFunc = (
  request: ToRealTimeRequest
) => ToRealTimeResponse;
export async function genToRealTime(
  config: $ReadOnlyArray<$ReadOnly<{
    GenesisDate?: string,
    ...,
  }>>,
): Promise<ToRealTimeFunc> {
  return (request: ToRealTimeRequest) => {
    const { GenesisDate } = config[0];
    if (GenesisDate == null) throw new Error(`${nameof(genToRealTime)} missing genesis start date`);

    const timeSinceGenesis = request.timeSinceGenesisFunc({
      absoluteSlotNum: request.absoluteSlotNum,
    });
    const time = (new Date(Number.parseInt(GenesisDate, 10)).getTime() + (1000 * timeSinceGenesis));
    return new Date(time);
  };
}
