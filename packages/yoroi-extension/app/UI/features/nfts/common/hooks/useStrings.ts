import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

export const messages = Object.freeze(
  defineMessages({
    searchNfts: {
      id: 'wallet.nftGallary.search',
      defaultMessage: '!!!Search NFTs',
    },
    nftsCount: {
      id: 'wallet.nftGallary.details.nftsCount',
      defaultMessage: '!!!NFTs ({number})',
    },
    nfts: {
      id: 'sidebar.nfts',
      defaultMessage: '!!!NFTs',
    },
    back: {
      id: 'wallet.nftGallary.details.back',
      defaultMessage: '!!!Back to gallery',
    },
    copyMetadata: {
      id: 'wallet.nftGallary.details.copyMetadata',
      defaultMessage: '!!!Copy metadata',
    },
    description: {
      id: 'wallet.nftGallary.details.description',
      defaultMessage: '!!!Description',
    },
    author: {
      id: 'wallet.nftGallary.details.author',
      defaultMessage: '!!!Author',
    },
    fingerprint: {
      id: 'wallet.assets.fingerprint',
      defaultMessage: '!!!Fingerprint',
    },
    policyId: {
      id: 'wallet.assets.policyId',
      defaultMessage: '!!!Policy ID',
    },
    detailsOn: {
      id: 'wallet.assets.detailsOn',
      defaultMessage: '!!!Details on',
    },
    cardanoScan: {
      id: 'global.explorers.cardanoscan',
      defaultMessage: '!!!Cardanoscan',
    },
  })
);

export const useStrings = () => {
  const intl = useIntl();
  return React.useRef({
    searchNfts: intl.formatMessage(messages.searchNfts),
    nftsCount: (numNfts: number) => intl.formatMessage(messages.nftsCount, { number: numNfts }),
    nfts: intl.formatMessage(messages.nfts),
    back: intl.formatMessage(messages.back),
    copyMetadata: intl.formatMessage(messages.copyMetadata),
    description: intl.formatMessage(messages.description),
    author: intl.formatMessage(messages.author),
    fingerprint: intl.formatMessage(messages.fingerprint),
    policyId: intl.formatMessage(messages.policyId),
    detailsOn: intl.formatMessage(messages.detailsOn),
    cardanoScan: intl.formatMessage(messages.cardanoScan),
  }).current;
};
