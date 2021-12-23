// @flow

import { Component } from 'react';
import type { Node } from 'react'
import styles from './TokensAmountPreview.scss'
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import NoAssetLogo from '../../../../assets/images/assets-page/asset-no.inline.svg';
import { truncateToken } from '../../../../utils/formatters';
import { genFormatTokenAmount, getTokenIdentifierIfExists, getTokenStrictName } from '../../../../stores/stateless/tokenHelpers';


export default class TokensAmountPreview extends Component {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    genTokensList() {
        const { spendableBalance } = this.props
        if (spendableBalance == null) return [];
        return spendableBalance.nonDefaultEntries().map(entry => ({
            entry,
            info: getTokenInfo(entry),
        })).filter(token => !token.info.IsNFT).map(token => {
            const amount = genFormatTokenAmount(getTokenInfo)(token.entry)
            return {
                value: token.info.TokenId,
                info: token.info,
                label: truncateToken(getTokenStrictName(token.info) ?? getTokenIdentifierIfExists(token.info) ?? '-'),
                id: (getTokenIdentifierIfExists(token.info) ?? '-'),
                amount,
            }
        });
    }

    genNftsList() {
        const { spendableBalance } = this.props
        if (spendableBalance == null) return [];
        return this.props.nonDefaultEntries().map(entry => ({
          entry,
          info: this.props.getTokenInfo(entry),
        })).filter(token => token.info.IsNFT).map(token => {
          const policyId = token.entry.identifier.split('.')[0];
          const name = truncateToken(getTokenStrictName(token.info) ?? '-');
          return {
            name,
            id: getTokenIdentifierIfExists(token.info) ?? '-',
            amount: genFormatTokenAmount(this.props.getTokenInfo)(token.entry),
            policyId,
            // $FlowFixMe[prop-missing]
            nftMetadata: token.info.Metadata.assetMintMetadata?.[0]['721'][policyId][name],
          };
        })
        .map(item => ({
          name: item.name,
          image: item.nftMetadata?.image,
        }));
    }

    render(): Node {
        const { intl } = this.context;
        const nfts = this.genNftsList()
        const tokens = this.genTokensList()

        return (
          <div className={styles.component}>
            <div className={styles.tokens}>
              {tokens.length > 0 && (
                <div>
                  <h6 className={styles.title}>{intl.formatMessage(globalMessages.tokens)}</h6>
                    {tokens.map(token => (
                      <div key={token.id} className={styles.tokenRow}>
                        <div className={styles.logo}><NoAssetLogo /></div>
                        <p className={styles.label}>{token.label}</p>
                        <p className={styles.amount}>{token.amount}</p>
                      </div>
                    ))}
                </div>
                )}
            </div>
            <div>
              {nfts.length > 0 && (
                <div>
                  <h6 className={styles.title}>{intl.formatMessage(globalMessages.tokens)}</h6>
                    {nfts.map(({ name, image }) => (
                      <div key={name} className={styles.tokenRow}>
                        <div className={styles.logo}><NoAssetLogo /></div>
                        <p className={styles.label}>{name}</p>
                      </div>
                    ))}
                </div>
                )}
            </div>
          </div>
        )
    }
}