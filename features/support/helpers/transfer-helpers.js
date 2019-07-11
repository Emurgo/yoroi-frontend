// @flow

import BigNumber from 'bignumber.js';
import {
  LOVELACES_PER_ADA,
  DECIMAL_PLACES_IN_ADA
} from '../../../app/config/numbersConfig';

export async function checkAddressesRecoveredAreCorrect(rows, world) {
  const waitUntilAddressesRecoveredAppeared = rows.map((row, index) => (
    world.waitUntilText(
      `.addressRecovered-${index + 1}`,
      row.fromAddress
    )
  ));
  await Promise.all(waitUntilAddressesRecoveredAppeared);
}

export async function checkTotalAmountIsCorrect(rows, world) {
  const totalAmount = rows.reduce(
    (acc, row) => acc.plus(new BigNumber(row.amount)), new BigNumber(0)
  );
  const totalAmountFormated = `${totalAmount
    .dividedBy(LOVELACES_PER_ADA)
    .toFormat(DECIMAL_PLACES_IN_ADA)} ADA`;
  await world.waitUntilText(
    '.TransferSummaryPage_amount',
    totalAmountFormated
  );
}
