// @flow

// TODO: delete this and replace it with a Request object
export const LoadingWalletStates = Object.freeze({
  IDLE: 0,
  PENDING: 1,
  SUCCESS: 2,
  REJECTED: 3,
});

export const WalletTypes = {
  ERGO: 'ERGO',
  CARDANO: 'CARDANO'
};