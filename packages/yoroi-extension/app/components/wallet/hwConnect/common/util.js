export const isTxCancelledByUser = error => {
  return error?.id === 'wallet.hw.ledger.common.error.101' || error?.id === 'wallet.send.trezor.error.101';
};
