import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../../../context/IntlProvider';

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
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  return React.useRef({
    searchNfts: intl.formatMessage(messages.searchNfts),
    nftsCount: (numNfts: number) => intl.formatMessage(messages.nftsCount, { number: numNfts }),
    nfts: intl.formatMessage(messages.nfts),
  }).current;
};
