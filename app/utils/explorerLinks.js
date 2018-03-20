const EXPLORER_PATH = 'https://explorer.iohkdev.io';

export const openTx = function (tx) {
  return window.open(`${EXPLORER_PATH}/tx/${tx}`, '_blank');
};

export const openAddress = function (addr) {
  return window.open(`${EXPLORER_PATH}/address/${addr}`, '_blank');
};
