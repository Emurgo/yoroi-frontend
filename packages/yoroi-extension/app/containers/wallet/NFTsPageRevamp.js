// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import type { Node } from 'react';
import {
  genLookupOrFail,
  getTokenIdentifierIfExists,
  getTokenStrictName,
} from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';
import NfTsList from '../../components/wallet/assets/NFTsList';
import { getImageFromTokenMetadata } from '../../utils/nftMetadata';
import { once } from 'lodash';
import { ampli } from '../../../ampli/index';

@observer
export default class NFTsPageRevamp extends Component<StoresAndActionsProps> {
  trackPageViewed: (number) => void = once((nftCount) => {
    setTimeout(() => {
      ampli.nftGalleryPageViewed({
        nft_count: nftCount,
      });
    }, 0);
  });

  render(): Node {
    const publicDeriver = this.props.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(NFTsPageRevamp)}.`);
    const spendableBalance = this.props.stores.transactions.balance;
    const getTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo);

    const nftsList = (() => {
      if (spendableBalance == null) return [];
      return [...spendableBalance.nonDefaultEntries()]
        .map(entry => ({
          entry,
          info: getTokenInfo(entry),
        }))
        .filter(item => item.info.IsNFT)
        .map(token => {
          const split = token.entry.identifier.split('.');
          const policyId = split[0];
          const hexName = split[1] ?? '';
          const fullName = getTokenStrictName(token.info).name;
          const name = truncateToken(fullName ?? '-');
          return {
            name,
            id: getTokenIdentifierIfExists(token.info) ?? '-',
            image: getImageFromTokenMetadata(policyId, hexName, token.info.Metadata),
          };
        });
    })();

    this.trackPageViewed(nftsList.length);

    return <NfTsList list={nftsList} />;
  }
}
