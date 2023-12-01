// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import type { Node } from 'react';
import {
  genLookupOrFail,
  getTokenIdentifierIfExists,
  getTokenStrictName,
} from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';
import { computed } from 'mobx';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import NfTsList from '../../components/wallet/assets/NFTsList';
import { getImageFromTokenMetadata } from '../../utils/nftMetadata';
import { once } from 'lodash';
import { ampli } from '../../../ampli/index';

export type GeneratedData = typeof NFTsPageRevamp.prototype.generated;

@observer
export default class NFTsPageRevamp extends Component<InjectedOrGenerated<GeneratedData>> {
  trackPageViewed: (number) => void = once((nftCount) => {
    setTimeout(() => {
      ampli.nftGalleryPageViewed({
        nft_count: nftCount,
      });
    }, 0);
  });

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(NFTsPageRevamp)}.`);
    const spendableBalance = this.generated.stores.transactions.balance;
    const getTokenInfo = genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo);

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
          const fullName = getTokenStrictName(token.info);
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

  @computed get generated(): {|
    stores: {|
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      transactions: {| balance: MultiToken | null |},
      wallets: {| selected: null | PublicDeriver<> |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null) {
      throw new Error(`${nameof(NFTsPageRevamp)} no way to generated props`);
    }
    const { stores } = this.props;
    return Object.freeze({
      stores: {
        wallets: {
          selected: stores.wallets.selected,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        transactions: {
          balance: stores.transactions.balance,
        },
      },
    });
  }
}
