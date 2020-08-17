// @flow

import BigNumber from 'bignumber.js';
import { getAdaCurrencyMeta } from '../../../app/api/ada/currencyInfo';
import { truncateAddress, } from '../../../app/utils/formatters';

type TransferSourceType = Array<{|
  fromAddress: string,
  amount: string | number
|}>;

export async function baseCheckAddressesRecoveredAreCorrect(
  rows: TransferSourceType,
  world: Object,
  fieldName: string,
):Promise<void> {
  const waitUntilAddressesRecoveredAppeared = rows.map((row, index) => (
    world.waitUntilText(
      `.${fieldName}-${index + 1}`,
      truncateAddress(row.fromAddress)
    )
  ));
  await Promise.all(waitUntilAddressesRecoveredAppeared);
}
export async function checkAddressesRecoveredAreCorrect(
  rows: TransferSourceType,
  world: Object
):Promise<void> {
  return baseCheckAddressesRecoveredAreCorrect(
    rows,
    world,
    'addressRecovered'
  );
}
export async function checkWithdrawalAddressesRecoveredAreCorrect(
  rows: TransferSourceType,
  world: Object
):Promise<void> {
  return baseCheckAddressesRecoveredAreCorrect(
    rows,
    world,
    'withdrawal'
  );
}

export async function checkTotalAmountIsCorrect(
  rows: TransferSourceType,
  world: Object
):Promise<void> {
  const totalAmount = rows.reduce(
    (acc, row) => acc.plus(new BigNumber(row.amount)), new BigNumber(0)
  );
  const { decimalPlaces } = getAdaCurrencyMeta();
  const amountPerUnit = new BigNumber(10).pow(decimalPlaces);
  const totalAmountFormatted = `${totalAmount
    .dividedBy(amountPerUnit)
    .toFormat(decimalPlaces.toNumber())} ADA`;
  await world.waitUntilText(
    '.TransferSummaryPage_amount',
    totalAmountFormatted
  );
}
