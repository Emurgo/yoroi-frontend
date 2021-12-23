// @flow

import { Component } from 'react';
import type { Node } from 'react'
import { genFormatTokenAmount, getTokenIdentifierIfExists, getTokenStrictName } from '../../../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../../../utils/formatters';

export default class TokensAmountPreview extends Component {

    genTokensList() {
        const { spendableBalance } = this.props;
      if (spendableBalance == null) return null;
      const allAssets =  [
        ...spendableBalance.nonDefaultEntries(),
      ].map(entry => ({
        entry,
        info: this.props.getTokenInfo(entry),
      })).map(token => {
        const amount = genFormatTokenAmount(this.props.getTokenInfo)(token.entry)
        return {
          value: token.info.TokenId,
          info: token.info,
          label: truncateToken(getTokenStrictName(token.info) ?? getTokenIdentifierIfExists(token.info) ?? '-'),
          id: (getTokenIdentifierIfExists(token.info) ?? '-'),
          amount,
        }
      });

      const nfts = []
      const tokens = []
      for(const asset of allAssets) {
        if (asset.info.IsNFT) nfts.push(asset)
        else tokens.push(asset)
      }

      return { nfts, tokens }
    }

    render(): Node {

        return (
            <div>
                hello
            </div>
        )
    }
}