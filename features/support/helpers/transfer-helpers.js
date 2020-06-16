// @flow

import BigNumber from 'bignumber.js';
import { getAdaCurrencyMeta } from '../../../app/api/ada/currencyInfo';

type TransferSourceType = Array<{|
  fromAddress: string,
  amount: string | number
|}>;

export async function checkAddressesRecoveredAreCorrect(
  rows: TransferSourceType,
  world: Object
):Promise<void> {
  const waitUntilAddressesRecoveredAppeared = rows.map((row, index) => (
    world.waitUntilText(
      `.addressRecovered-${index + 1}`,
      row.fromAddress
    )
  ));
  await Promise.all(waitUntilAddressesRecoveredAppeared);
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
  const totalAmountFormated = `${totalAmount
    .dividedBy(amountPerUnit)
    .toFormat(decimalPlaces.toNumber())} ADA`;
  await world.waitUntilText(
    '.TransferSummaryPage_amount',
    totalAmountFormated
  );
}
