// @flow

import BigNumber from 'bignumber.js';

export function bytesToHex(bytes) {
  return Buffer.from(bytes).toString('hex');
}

export function hexToBytes(hex) {
  return Buffer.from(hex, 'hex');
}

export function getTtl() {
  const fullConfig = [
    {
      StartAt: 0,
      ChainNetworkId: '0',
      ByronNetworkId: 1097911063,
      GenesisDate: '1563999616000',
      SlotsPerEpoch: 21600,
      SlotDuration: 20,
    },
    {
      StartAt: 74,
      SlotsPerEpoch: 432000,
      SlotDuration: 1,
      PerEpochPercentageReward: 69344,
      LinearFee: {
        coefficient: '44',
        constant: '155381',
      },
      MinimumUtxoVal: '1000000',
      PoolDeposit: '500000000',
      KeyDeposit: '2000000',
    },
  ];
  const defaultTtlOffset = 7200;
  const timeToSlot = genTimeToSlot(fullConfig);
  const absSlotNumber = new BigNumber(
    timeToSlot({
      time: new Date(1649261533360),
    }).slot
  );

  return absSlotNumber.plus(defaultTtlOffset).toNumber();
}

function genTimeToSlot(
  config /*: $ReadOnlyArray<$ReadOnly<{
    StartAt?: number,
    GenesisDate?: string,
    SlotsPerEpoch?: number,
    SlotDuration?: number,
    ...,
  }>> */
) /*: TimeToAbsoluteSlotFunc */ {
  return (request /*: TimeToAbsoluteSlotRequest */) => {
    const { GenesisDate } = config[0];
    if (GenesisDate == null) throw new Error(`${nameof(genTimeToSlot)} missing genesis params`);
    let SlotDuration = config[0].SlotDuration;
    let SlotsPerEpoch = config[0].SlotsPerEpoch;
    let timeLeftToTip =
      request.time.getTime() - new Date(Number.parseInt(GenesisDate, 10)).getTime();
    let slotCount = 0;

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start = config[i].StartAt;
      if (start === undefined) {
        throw new Error(`${nameof(genTimeToSlot)} missing start`);
      }
      const end = config[i + 1].StartAt;
      if (end === undefined) {
        throw new Error(`${nameof(genTimeToSlot)} missing end`);
      }
      const numEpochs = end - start;

      if (SlotDuration == null || SlotsPerEpoch == null)
        throw new Error(`${nameof(genTimeToSlot)} missing params`);

      // queried time is before the next protocol parameter choice
      if (timeLeftToTip < SlotsPerEpoch * SlotDuration * 1000 * numEpochs) {
        break;
      }
      slotCount += SlotsPerEpoch * numEpochs;
      timeLeftToTip -= SlotsPerEpoch * SlotDuration * 1000 * numEpochs;

      if (config[i + 1].SlotDuration !== undefined) {
        SlotDuration = config[i + 1].SlotDuration;
      }
      if (config[i + 1].SlotsPerEpoch !== undefined) {
        SlotsPerEpoch = config[i + 1].SlotsPerEpoch;
      }
    }

    if (SlotDuration == null || SlotsPerEpoch == null)
      throw new Error(`${nameof(genTimeToSlot)} missing params`);

    // find how many slots since the last update
    const secondsSinceLastUpdate = timeLeftToTip / 1000;
    slotCount += Math.floor(secondsSinceLastUpdate / SlotDuration);

    const msIntoSlot = timeLeftToTip % 1000;
    const secondsIntoSlot = secondsSinceLastUpdate % SlotDuration;
    return {
      slot: slotCount,
      msIntoSlot: 1000 * secondsIntoSlot + msIntoSlot,
    };
  };
}
