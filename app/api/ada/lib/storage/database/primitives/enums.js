// @flow

export const CoreAddressTypes = Object.freeze({
  CARDANO_LEGACY: 0,
  CARDANO_BASE: 1,
  CARDANO_PTR: 2,
  CARDANO_ENTERPRISE: 3,
  CARDANO_REWARD: 4,
  /**
   * Note: we store Shelley addresses as the full payload (not just payment key)
   * since it's easier to extract a key from a payload then the inverse
   *
   * This also matches how the remote works as it has to return the full payload
   * so we can tell the address type
   */
  JORMUNGANDR_SINGLE: 1_00,
  JORMUNGANDR_GROUP: 1_01,
  JORMUNGANDR_ACCOUNT: 1_02,
  JORMUNGANDR_MULTISIG: 1_03,
  ERGO_P2PK: 2_00,
  ERGO_P2SH: 2_01,
  ERGO_P2S: 2_02,
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
