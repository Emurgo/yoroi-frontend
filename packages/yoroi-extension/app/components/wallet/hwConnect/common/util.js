export const isTxCancelledByUser = error => {
  return error?.id === 'wallet.hw.ledger.common.error.101';
};
