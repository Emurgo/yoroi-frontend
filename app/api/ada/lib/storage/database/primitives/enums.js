// @flow

export const CoreAddressTypes = Object.freeze({
  CARDANO_LEGACY: 0,
  /**
   * Note: we store Shelley addresses as the full payload (not just payment key)
   * since it's easier to extract a key from a payload then the invverse
   *
   * This also matches how the remote works as it has to return the full payload
   * so we can tell the address type
   */
  SHELLEY_SINGLE: 1,
  SHELLEY_GROUP: 2,
  SHELLEY_ACCOUNT: 3,
  SHELLEY_MULTISIG: 4,
});
export type CoreAddressT = $Values<typeof CoreAddressTypes>;

export const TxStatusCodes = Object.freeze({
  NOT_IN_REMOTE: -3,
  ROLLBACK_FAIL: -2,
  FAIL_RESPONSE: -1,
  PENDING: 0,
  IN_BLOCK: 1,
});
export type TxStatusCodesType = $Values<typeof TxStatusCodes>;
