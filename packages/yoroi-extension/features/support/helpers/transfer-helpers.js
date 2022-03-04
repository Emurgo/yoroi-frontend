// @flow

import BigNumber from 'bignumber.js';
import { truncateAddress } from '../../../app/utils/formatters';
import {
  networks,
  defaultAssets,
} from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import { getTokenName } from '../../../app/stores/stateless/tokenHelpers';

type TransferSourceType = Array<{|
  fromAddress: string,
  amount: string | number,
|}>;

type WithdrawSourceType = {|
  fromAddress: string,
  reward: string | number,
  fees: string | number,
  recoveredBalance: string | number,
|};

function stripZerosFromEnd(inputNumber: string) {
  const inputLength = inputNumber.length;
  const inputArray = inputNumber.split('');
  for (let i = inputLength - 1; i >= 0; i--) {
    if (inputArray[i] === '0') {
      inputArray.splice(i, 1);
    } else if (inputArray[i] === '.') {
      inputArray.splice(i, 1);
      break;
    } else {
      break;
    }
  }

  return inputArray.join('');
}

export async function baseCheckAddressesRecoveredAreCorrect(
  rows: TransferSourceType,
  world: Object,
  fieldName: string
): Promise<void> {
  const waitUntilAddressesRecoveredAppeared = rows.map((row, index) =>
    world.waitUntilText(`.${fieldName}-${index + 1}`, truncateAddress(row.fromAddress))
  );
  await Promise.all(waitUntilAddressesRecoveredAppeared);
}
export async function checkAddressesRecoveredAreCorrect(
  rows: TransferSourceType,
  world: Object
): Promise<void> {
  return baseCheckAddressesRecoveredAreCorrect(rows, world, 'addressRecovered');
}
export async function checkWithdrawalAddressesRecoveredAreCorrect(
  rows: TransferSourceType,
  world: Object
): Promise<void> {
  return baseCheckAddressesRecoveredAreCorrect(rows, world, 'withdrawal');
}

export async function checkTotalAmountIsCorrect(
  rows: TransferSourceType,
  world: Object
): Promise<void> {
  const totalAmount = rows.reduce(
    (acc, row) => acc.plus(new BigNumber(row.amount)),
    new BigNumber(0)
  );
  const network = networks.CardanoMainnet;
  const assetInfo = defaultAssets.filter(asset => asset.NetworkId === network.NetworkId)[0];

  const decimalPlaces = assetInfo.Metadata.numberOfDecimals;
  const ticker = getTokenName(assetInfo);
  const amountPerUnit = new BigNumber(10).pow(decimalPlaces);
  const totalAmountFormatted = `${totalAmount
    .dividedBy(amountPerUnit)
    .toFormat(decimalPlaces)} ${ticker}`;
  await world.waitUntilText('.TransferSummaryPage_amount', totalAmountFormatted);
}

export async function checkFinalBalanceIsCorrect(
  fields: WithdrawSourceType,
  world: Object,
  useReward: boolean
): Promise<void> {
  const reservedFunds = 2;
  const givenAmount = useReward
    ? parseFloat(fields.reward) + reservedFunds
    : parseFloat(fields.recoveredBalance);
  const finalAmount = stripZerosFromEnd(
    parseFloat(givenAmount - parseFloat(fields.fees)).toFixed(6)
  );

  const network = networks.CardanoMainnet;
  const assetInfo = defaultAssets.filter(asset => asset.NetworkId === network.NetworkId)[0];
  const ticker = getTokenName(assetInfo);
  const finalBalance = `${finalAmount} ${ticker}`;

  await world.waitUntilText('.TransferSummaryPage_totalAmount', finalBalance);
}
