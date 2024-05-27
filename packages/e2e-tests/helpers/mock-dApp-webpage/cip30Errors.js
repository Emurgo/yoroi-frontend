// erros codes from the CIP-30 https://cips.cardano.org/cips/cip30/#errortypes

export const ApiErrorCode = Object.freeze({
  InvalidRequest: -1,
  InternalError: -2,
  Refused: -3,
  AccountChange: -4,
});

export const DataSignErrorCode = Object.freeze({
  ProofGeneration: 1,
  AddressNotPK: 2,
  UserDeclined: 3,
});

export const TxSendErrorCode = Object.freeze({
  Refused: 1,
  Failure: 2,
});

export const TxSignErrorCode = Object.freeze({
  ProofGeneration: 1,
  UserDeclined: 2,
});
