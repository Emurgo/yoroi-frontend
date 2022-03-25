// @flow
import type { Node } from 'react'
import { Component } from 'react';
import { getTokens, getNFTs } from '../../../../utils/wallet'
import styles from './IncludedTokens.scss'
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import NoAssetLogo from '../../../../assets/images/assets-page/asset-no.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import RemoveIcon from '../../../../assets/images/forms/close.inline.svg';

export default class IncludedTokens extends Component {

    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    renderTokens(tokens): Node {
        return (
          tokens.map(token => (
            <div className={styles.tokenRow} key={token.id}>
              <div className={styles.token}>
                <div className={styles.label}>
                  <NoAssetLogo />
                  <p>{token.label}</p>
                </div>
                <p className={styles.amount}>{token.amount}</p>
              </div>

              <div>
                <button type='button' className={styles.remove}> <RemoveIcon /> </button>
              </div>
            </div>
          ))
        )
    }

    renderNfts(nfts): Node {
        return (
            nfts.map(nft => (
              <div>
                {/* <img src={} alt="" />
                <h1>Hello</h1> */}
              </div>
            ))
        )
    }

    render(): Node {
        const { intl } = this.context
        const { spendableBalance, getTokenInfo } = this.props
        const tokens = getTokens(spendableBalance, getTokenInfo)
        const nfts = getNFTs(spendableBalance, getTokenInfo)
        return (
          <div className={styles.component}>
            <div>
              <h1 className={styles.header}>{intl.formatMessage(globalMessages.tokens)}</h1>
              <div>
                {this.renderTokens(tokens)}
              </div>
            </div>
            <div>
              <h1 className={styles.header}>{intl.formatMessage(globalMessages.nfts)}</h1>
              <div>
                {this.renderNfts(nfts)}
              </div>
            </div>
          </div>
        )
    }
}