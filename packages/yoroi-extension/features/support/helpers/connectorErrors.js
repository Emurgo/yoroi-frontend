// @flow
// erros codes from the CIP-30 https://cips.cardano.org/cips/cip30/#errortypes

export const ApiErrorCode = {
    InvalidRequest: -1,
    InternalError: -2,
    Refused: -3,
    AccountChange: -4
};

export const DataSignErrorCode = {
    ProofGeneration: 1,
    AddressNotPK: 2,
    UserDeclined: 3,
};

export const TxSendErrorCode = {
    Refused: 1,
    Failure: 2,
};

export const TxSignErrorCode = {
    ProofGeneration: 1,
    UserDeclined: 2,
};