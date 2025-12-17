import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from 'react-intl';
import globalMessages from '../../../../../i18n/global-messages';

export const messages = Object.freeze(
  defineMessages({
    // AddressCard messages
    dstAddrs: {
      id: 'airdrop.addrCard.destAddrs',
      defaultMessage: '!!!Destination addresses ({count})',
    },
    dstAddr: {
      id: 'aidrop.addrCard.destAddr',
      defaultMessage: '!!!Destination address {index}',
    },
    dstAddrLabel: {
      id: 'airdrop.addrCard.destAddrLabel',
      defaultMessage: '!!!Destination address',
    },
    status: {
      id: 'aidrop.addrCard.statusLabel',
      defaultMessage: '!!!Status',
    },
    redeemable: {
      id: 'airdrop.addrCard.redeemableLabel',
      defaultMessage: '!!!Redeemable',
    },
    total: {
      id: 'airdrop.addrCard.totalLabel',
      defaultMessage: '!!!Total to redeem',
    },
    statusReady: {
      id: 'airdrop.addrCard.statusReady',
      defaultMessage: '!!!Ready for redemption',
    },
    statusNotReady: {
      id: 'airdrop.addrCard.statusNotReady',
      defaultMessage: '!!!Waiting for thawing',
    },
    // AbortDialog messages
    abortDialogTitle: {
      id: 'airdrop.abort.title',
      defaultMessage: '!!!no response',
    },
    abortDialogText1: {
      id: 'airdrop.abort.text1',
      defaultMessage: '!!!Loading is taking longer than expected',
    },
    abortDialogText2: {
      id: 'airdrop.abort.text2',
      defaultMessage: '!!!Do you want to continue the process?',
    },
    // AddressDetails messages
    details: {
      id: 'aidrop.addrDetail.detailsLabel',
      defaultMessage: '!!!More Midnight airdrop details',
    },
    currentThaw: {
      id: 'airdrop.schedule.currentThaw',
      defaultMessage: '!!!Current thaw: {current}/{total}',
    },
    thawTitle: {
      id: 'airdrop.schedule.thawTitle',
      defaultMessage: '!!!Thaw {index}/{total}',
    },
    notAvailable: {
      id: 'airdrop.schedule.notAvailable',
      defaultMessage: '!!!Not available yet',
    },
    redeemed: {
      id: 'airdrop.schedule.redeemed',
      defaultMessage: '!!!Redeemed',
    },
    thawExplanation: {
      id: 'airdrop.schedule.thawExplanation',
      defaultMessage: '!!!Each thaw is 25% of your claimed NIGHT allocation',
    },
    statusLabel: {
      id: 'airdrop.addrDetails.statusLabel',
      defaultMessage: '!!!Redemption status',
    },
    subTitle: {
      id: 'airdrop.addrDetails.subTitle',
      defaultMessage: '!!!🧩 <strong>Thawing & Redemption</strong> of Midnight airdrop has started.',
    },
    redeemableNow: {
      id: 'airdrop.addrDetails.redeemableNow',
      defaultMessage: '!!!Redeemable now',
    },
    allocationSize: {
      id: 'airdrop.addrDetails.allocationSize',
      defaultMessage: '!!!Allocation size',
    },
    claimedAllocations: {
      id: 'airdrop.addrDetails.claimedAllocations',
      defaultMessage: '!!!No. of claimed allocations',
    },
    redeemedSoFar: {
      id: 'airdrop.addrDetails.redeemedSoFar',
      defaultMessage: '!!!Redeemed so far',
    },
    totalLeftToRedeem: {
      id: 'airdrop.addrDetails.totalLeftToRedeem',
      defaultMessage: '!!!Total left to redeem',
    },
    totalToRedeem: {
      id: 'airdrop.addrDetails.totalToRedeem',
      defaultMessage: '!!!Total to redeem',
    },
    detailsOn: {
      id: 'airdrop.addrDetails.detailsOn',
      defaultMessage: '!!!Details on',
    },
    cardanoscan: {
      id: 'airdrop.addrDetails.cardanoscan',
      defaultMessage: '!!!Cardanoscan',
    },
    adaex: {
      id: 'airdrop.addrDetails.adaex',
      defaultMessage: '!!!Adaex',
    },
    // ClaimDialog messages
    claimDialogTitle: {
      id: 'airdrop.claimDialogTitle',
      defaultMessage: '!!!sign message',
    },
    messageLabel: {
      id: 'airdrop.messageLabel',
      defaultMessage: '!!!Message',
    },
    wrongPassword: {
      id: 'airdrop.wrongPassword',
      defaultMessage: '!!!Wrong password',
    },
    mnemonicClaimDialogText: {
      id: 'airdrop.mnemonicClaimDialogText',
      defaultMessage:
        "!!!Please sign message to prove ownership of your assets. Signing this message will not affect your wallet's balance in any way and does not require you to pay any fees.",
    },
    error403: {
      id: 'airdrop.error.403',
      defaultMessage: '!!!Error 403: Unable to claim due to API error',
    },
    errorNotResponding: {
      id: 'airdrop.error.notResponding',
      defaultMessage: '!!!Midnight API is not responding, please try again later.',
    },
    // ClaimInfo messages
    phase1Allocation: {
      id: 'airdrop.phase1Allocation',
      defaultMessage: '!!!Phase 1: Your successfully claimed allocation',
    },
    destinationAddress: {
      id: 'airdrop.destinationAddress',
      defaultMessage: '!!!Your destination address',
    },
    allocationTooltip: {
      id: 'airdrop.tooltip.allocation',
      defaultMessage: '!!!This is the NIGHT token allocation entitlement for this claim based on the current wallet.',
    },
    destAddrTooltip: {
      id: 'airdrop.tooltop.destinationAddress',
      defaultMessage:
        '!!!A Destination address is the registered location for the Redemption of your NIGHT allocations -- that is, for receiving your redeemed tokens as they thaw. It must be an unused Cardano address -- i.e., must have no transaction history.',
    },
    phase2Title: {
      id: 'airdrop.phase2Title',
      defaultMessage: '!!!🧩  Phase 2 of midnight airdrop has started',
    },
    phase2Text: {
      id: 'airdrop.phase2Text',
      defaultMessage:
        '!!!The 2nd phase of midnight claiming called "Scavenger mine" has now started. Navigate to the midnight portal and connect your yoroi wallet to start earning NIGHT',
    },
    // LedgerClaimDialog messages
    ledgerClaimDialogTitle: {
      id: 'airdrop.ledgerClaimDialogTitle',
      defaultMessage: '!!!sign message { index } of { total }',
    },
    ledgerClaimDialogText: {
      id: 'airdrop.ledgerClaimDialogText',
      defaultMessage:
        '!!!Signing this messages proves you have ownership of the address you want to use to claim NIGHT. Each message must be signed individually per address',
    },
    // Terms messages
    terms: {
      id: 'airdrop.terms',
      defaultMessage: '!!!Terms & Conditions',
    },
    header1: {
      id: 'airdrop.terms.header1',
      defaultMessage: '!!!1. Acceptance of Terms',
    },
    section1_1: {
      id: 'airdrop.terms.section1_1',
      defaultMessage:
        '!!!By participating in the Midnight Glacier Airdrop ("Airdrop"), you ("Participant") agree to be bound by these Terms of Use ("Terms"). If you do not agree with these Terms, do not participate in the Airdrop.',
    },
    header2: {
      id: 'airdrop.terms.header2',
      defaultMessage: '!!!2. Eligibility',
    },
    section2_1: {
      id: 'airdrop.terms.section2_1',
      defaultMessage:
        '!!!2.1 Age Requirement: Participants must be at least 18 years old or the age of majority in their jurisdiction, whichever is higher.',
    },
    section2_2: {
      id: 'airdrop.terms.section2_2',
      defaultMessage:
        '!!!2.2 Jurisdiction: The Airdrop is not available to residents or citizens of countries where participation in cryptocurrency activities is restricted or illegal. It is your responsibility that you comply with your local laws.',
    },
    section2_3: {
      id: 'airdrop.terms.section2_3',
      defaultMessage: '!!!2.3 Verification: Participants may be required to undergo identity',
    },
    // Zero messages
    noAllocTitle: {
      id: 'aidrop.noAllocTitle',
      defaultMessage: '!!!No eligible addresses found in your wallet',
    },
    noRedemptionText: {
      id: 'aidrop.noRedemptionText',
      defaultMessage: '!!!None of the addresses in this wallet are eligible for redemption',
    },
    // Redeem messages
    redeemDialogTitle: {
      id: 'airdrop.redeem.dialogTitle',
      defaultMessage: '!!!Claim',
    },
    redeemLoading: {
      id: 'airdrop.redeem.loading',
      defaultMessage: '!!!...',
    },
    redeemButton: {
      id: 'airdrop.redeem.button',
      defaultMessage: '!!!Redeem',
    },
    redeemReorgMessage: {
      id: 'airdrop.redeem.reorgMessage',
      defaultMessage: '!!!Please re-orgnize the wallet for collateral UTxOs for redeeming',
    },
    redeemConfirmButton: {
      id: 'airdrop.redeem.confirmButton',
      defaultMessage: '!!!Confirm',
    },
    redeemNotEnoughBalance: {
      id: 'airdrop.redeem.notEnoughBalance',
      defaultMessage: '!!!not enough balance to redeem',
    },
    redeemErrorGettingCollaterals: {
      id: 'airdrop.redeem.errorGettingCollaterals',
      defaultMessage: '!!!Error when getting collaterals {message}',
    },
  })
);

export const useStrings = () => {
  const intl = useIntl();

  return React.useRef({
    // AddressCard
    dstAddrs: (count: number) => intl.formatMessage(messages.dstAddrs, { count }),
    dstAddr: (index: number) => intl.formatMessage(messages.dstAddr, { index }),
    dstAddrLabel: intl.formatMessage(messages.dstAddrLabel),
    status: intl.formatMessage(messages.status),
    redeemable: intl.formatMessage(messages.redeemable),
    total: intl.formatMessage(messages.total),
    statusReady: intl.formatMessage(messages.statusReady),
    statusNotReady: intl.formatMessage(messages.statusNotReady),
    // AbortDialog
    abortDialogTitle: intl.formatMessage(messages.abortDialogTitle),
    abortDialogText1: intl.formatMessage(messages.abortDialogText1),
    abortDialogText2: intl.formatMessage(messages.abortDialogText2),
    // AddressDetails
    details: intl.formatMessage(messages.details),
    currentThaw: (current: number, total: number) => intl.formatMessage(messages.currentThaw, { current, total }),
    thawTitle: (index: number, total: number) => intl.formatMessage(messages.thawTitle, { index, total }),
    notAvailable: intl.formatMessage(messages.notAvailable),
    redeemed: intl.formatMessage(messages.redeemed),
    thawExplanation: intl.formatMessage(messages.thawExplanation),
    statusLabel: intl.formatMessage(messages.statusLabel),
    subTitle: intl.formatMessage(messages.subTitle),
    redeemableNow: intl.formatMessage(messages.redeemableNow),
    allocationSize: intl.formatMessage(messages.allocationSize),
    claimedAllocations: intl.formatMessage(messages.claimedAllocations),
    redeemedSoFar: intl.formatMessage(messages.redeemedSoFar),
    totalLeftToRedeem: intl.formatMessage(messages.totalLeftToRedeem),
    totalToRedeem: intl.formatMessage(messages.totalToRedeem),
    detailsOn: intl.formatMessage(messages.detailsOn),
    cardanoscan: intl.formatMessage(messages.cardanoscan),
    adaex: intl.formatMessage(messages.adaex),
    // ClaimDialog
    claimDialogTitle: intl.formatMessage(messages.claimDialogTitle),
    messageLabel: intl.formatMessage(messages.messageLabel),
    wrongPassword: intl.formatMessage(messages.wrongPassword),
    mnemonicClaimDialogText: intl.formatMessage(messages.mnemonicClaimDialogText),
    error403: intl.formatMessage(messages.error403),
    errorNotResponding: intl.formatMessage(messages.errorNotResponding),
    // ClaimInfo
    phase1Allocation: intl.formatMessage(messages.phase1Allocation),
    destinationAddress: intl.formatMessage(messages.destinationAddress),
    allocationTooltip: intl.formatMessage(messages.allocationTooltip),
    destAddrTooltip: intl.formatMessage(messages.destAddrTooltip),
    phase2Title: intl.formatMessage(messages.phase2Title),
    phase2Text: intl.formatMessage(messages.phase2Text),
    // LedgerClaimDialog
    ledgerClaimDialogTitle: (index: number, total: number) =>
      intl.formatMessage(messages.ledgerClaimDialogTitle, { index, total }),
    ledgerClaimDialogText: intl.formatMessage(messages.ledgerClaimDialogText),
    // Terms
    terms: intl.formatMessage(messages.terms),
    header1: intl.formatMessage(messages.header1),
    section1_1: intl.formatMessage(messages.section1_1),
    header2: intl.formatMessage(messages.header2),
    section2_1: intl.formatMessage(messages.section2_1),
    section2_2: intl.formatMessage(messages.section2_2),
    section2_3: intl.formatMessage(messages.section2_3),
    // Zero
    noAllocTitle: intl.formatMessage(messages.noAllocTitle),
    noRedemptionText: intl.formatMessage(messages.noRedemptionText),
    // Redeem
    redeemDialogTitle: intl.formatMessage(messages.redeemDialogTitle),
    redeemLoading: intl.formatMessage(messages.redeemLoading),
    redeemButton: intl.formatMessage(messages.redeemButton),
    redeemReorgMessage: intl.formatMessage(messages.redeemReorgMessage),
    redeemConfirmButton: intl.formatMessage(messages.redeemConfirmButton),
    redeemNotEnoughBalance: intl.formatMessage(messages.redeemNotEnoughBalance),
    redeemErrorGettingCollaterals: (message: string) =>
      intl.formatMessage(messages.redeemErrorGettingCollaterals, { message }),
    // Global messages (re-exported for convenience)
    close: intl.formatMessage(globalMessages.close),
    continue: intl.formatMessage(globalMessages.continue),
    passwordLabel: intl.formatMessage(globalMessages.passwordLabel),
    walletLabel: intl.formatMessage(globalMessages.walletLabel),
    addressLabel: intl.formatMessage(globalMessages.addressLabel),
    goToMidnightApp: intl.formatMessage(globalMessages.goToMidnightApp),
    learnMore: intl.formatMessage(globalMessages.learnMore),
  }).current;
};
