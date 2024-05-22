import { AssertionError } from 'chai';

/**
 *
 * @param {any[]} arrayOne
 * @param {any[]} arrayTwo
 */
const compareArrayLength = (arrayOne, arrayTwo) => {
  if (arrayOne.length !== arrayTwo.length) {
    throw new AssertionError(
      `The exported txs array and displayed txs array have different length. Exported: ${exportedTxs.length}, Displayed: ${displayedTxs.length}`
    );
  }
};

/**
 *
 * @param {{txType: string, inAmount: number, outAmount: number, feeAmount: number, exchange: string, tradeGroup: string, comment: string, date: string, txHashId: string}[]} exportedTxs
 * @param {{txType: string, txTime: string, txDateTime: string, txStatus: string, txFee: number, txAmount: number, txHashId: string}[]} displayedTxs
 */
export const compareExportedTxsAndDisplayedTxs = (exportedTxs, displayedTxs) => {
  compareArrayLength(exportedTxs, displayedTxs);

  const errorMessages = [];
  for (const exportedTx of exportedTxs) {
    const foundTx = displayedTxs.filter(dTx => dTx.txHashId === exportedTx.txHashId);
    if (foundTx.length === 0) {
      errorMessages.push(
        `\n- The tx with txHasId "${exportedTx.txHashId}" wasn't found in the displayed txs`
      );
      continue;
    }
    const displayedTx = foundTx[0];

    const exportDateTimeStr = exportedTx.date.slice(0, exportedTx.date.length - 2) + '00';
    if (exportDateTimeStr !== displayedTx.txDateTime) {
      errorMessages.push(
        `\n- The tx with txHasId "${exportedTx.txHashId}" has diffent date.\n` +
          `  Exported: ${exportedTx.date}, Displayed: ${displayedTx.txDateTime}`
      );
    }
    if (exportedTx.feeAmount !== displayedTx.txFee) {
      errorMessages.push(
        `\n- The tx with txHasId "${exportedTx.txHashId}" has diffent fee.\n` +
          `  Exported: ${exportedTx.feeAmount}, Displayed: ${displayedTx.txFee}`
      );
    }
    // received tx
    if (exportedTx.feeAmount === 0 && exportedTx.inAmount !== displayedTx.txAmount) {
      errorMessages.push(
        `\n- The tx with txHasId "${exportedTx.txHashId}" has diffent amount.\n` +
          `  Exported: ${exportedTx.inAmount}, Displayed: ${displayedTx.txAmount}`
      );
    }
    const expectedAmount = displayedTx.txAmount * -1 - displayedTx.txFee;
    if (exportedTx.feeAmount !== 0 && exportedTx.outAmount !== expectedAmount) {
      errorMessages.push(
        `\n- The tx with txHasId "${exportedTx.txHashId}" has diffent amount.\n` +
          `  Exported: ${exportedTx.outAmount}, Displayed: ${displayedTx.txAmount}`
      );
    }
  }

  if (errorMessages.length !== 0) {
    throw new AssertionError(errorMessages.join('\n'));
  }
};
