// @flow

/**
 * we use an empty string to represent the ID of the primary currency for a chain
 * Since using null may not work if a given blockchain has multiple primary currencies
 */
export const PRIMARY_ASSET_CONSTANTS = {
  Cardano: '',
};

export const CoreAddressTypes = Object.freeze({
  CARDANO_LEGACY: 0,
  CARDANO_BASE: 1,
  CARDANO_PTR: 2,
  CARDANO_ENTERPRISE: 3,
  CARDANO_REWARD: 4,
});
export type CoreAddressT = $Values<typeof CoreAddressTypes>;

export const TxStatusCodes = Object.freeze({
  SUBMITTED: -4,
  NOT_IN_REMOTE: -3,
  ROLLBACK_FAIL: -2,
  FAIL_RESPONSE: -1,
  PENDING: 0,
  IN_BLOCK: 1,
});
export type TxStatusCodesType = $Values<typeof TxStatusCodes>;

export const CertificateRelation = Object.freeze({
  // note: we don't explicitly add the "delegator" of a StakeDelegation certificate as a type
  // since the signer of this kind of certificate much match the delegator so it would be redundant
  SIGNER: 0,
  REWARD_ADDRESS: 1,
  PLEDGE_ADDRESS: 2,
  OPERATOR: 3,
  OWNER: 4,
  POOL_KEY: 5,
});
export type CertificateRelationType = $Values<typeof CertificateRelation>;
