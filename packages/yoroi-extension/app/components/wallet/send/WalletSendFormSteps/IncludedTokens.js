// @flow
import type { Node } from 'react'
import { Component } from 'react';
import type { FormattedNFTDisplay, FormattedTokenDisplay } from '../../../../utils/wallet';
import styles from './IncludedTokens.scss';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as NoAssetLogo  }from '../../../../assets/images/assets-page/asset-no.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import { ReactComponent as RemoveIcon  }from '../../../../assets/images/forms/close.inline.svg';
import { ReactComponent as DefaultNFTIcon  }from '../../../../assets/images/nft-no.inline.svg';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  +shouldSendAll: boolean,
  +onRemoveToken: (void | $ReadOnly<TokenRow>) => void,
  +tokens: FormattedTokenDisplay[],
  +nfts: FormattedNFTDisplay[],
|}
export default class IncludedTokens extends Component<Props> {

    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    renderTokens(tokens: FormattedTokenDisplay[]): Node {
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
              {!this.props.shouldSendAll && <button onClick={() => this.props.onRemoveToken(token.info)} type='button' className={styles.remove}> <RemoveIcon /> </button>}
            </div>
          </div>
        ))
      )
    }

    renderNfts(nfts: FormattedNFTDisplay[]): Node {
      return (
        nfts.map(nft => {
          const image = nft.image != null ? nft.image.replace('ipfs://', '') : '';

          return (
            <div className={styles.nftRow} key={nft.name}>
              <div className={styles.nft}>
                <div className={styles.nftImg}>
                  {image ? <img src={`https://ipfs.io/ipfs/${image}`} alt={nft.name} loading="lazy" /> : <DefaultNFTIcon />}
                </div>
                <p className={styles.name}>{nft.name}</p>
              </div>

              <div>
                {!this.props.shouldSendAll && <button type='button' onClick={() => this.props.onRemoveToken(nft.info)} className={styles.remove}> <RemoveIcon /> </button>}
              </div>
            </div>
          )
        })
      )
    }

    render(): Node {
      const { intl } = this.context
      const { tokens, nfts } = this.props;
      return (
        <div className={styles.component}>
          {
            tokens.length > 0 && (
              <div>
                <h1 className={styles.header}>{intl.formatMessage(globalMessages.tokens)}</h1>
                <div>
                  {this.renderTokens(tokens)}
                </div>
              </div>
            )
          }
          {
            nfts.length > 0 && (
              <div>
                <h1 className={styles.header}>{intl.formatMessage(globalMessages.nfts)}</h1>
                <div>
                  {this.renderNfts(nfts)}
                </div>
              </div>
            )
          }
        </div>
      )
    }
}