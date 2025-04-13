import { expect } from 'chai';

export const LedgerModels = Object.freeze({
  NanoS: 'nanos',
  NanoSPlus: 'nanosp',
  NanoX: 'nanox',
});

/**
 * Getting cleaned info from screens
 * @param {Array<string>} ledgerScreensContent
 * @returns {{addressDerivationPath: string, addressFull: string, stakeKeyPath: string}}
 */
export const convertVerifiedAddressesInfo = ledgerScreensContent => {
  expect(
    ledgerScreensContent.length,
    'Ledger screens contents amount is different from expected'
  ).to.equal(3);

  const addrDerPathSplit = ledgerScreensContent[0].split(' ');
  const addressDerivationPath = addrDerPathSplit[addrDerPathSplit.length - 1];

  const stakeKeyPathSplit = ledgerScreensContent[1].split(' ');
  const stakeKeyPath = stakeKeyPathSplit[stakeKeyPathSplit.length - 1];

  const addressFull = ledgerScreensContent[2].trim().replace(/ /g, '');
  return {
    addressDerivationPath,
    addressFull,
    stakeKeyPath,
  };
};
