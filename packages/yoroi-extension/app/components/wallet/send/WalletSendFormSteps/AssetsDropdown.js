// @flow
import { Component } from 'react';
import type { Node } from 'react'
import styles from './AssetsDropdown.scss'
import { ReactComponent as DefaultAssetIcon }  from '../../../../assets/images/assets-page/asset-no.inline.svg'
import { ReactComponent as ArrowUpIcon }  from '../../../../assets/images/arrow-up.inline.svg'
import { ReactComponent as ArrowDownIcon }  from '../../../../assets/images/arrow-down.inline.svg'
import type { Asset } from '../../assets/AssetsList'
import globalMessages from '../../../../i18n/global-messages';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as DefaultNFTIcon  }from '../../../../assets/images/nft-no.inline.svg';


type Props = {|
    +assets: Asset[],
    +tokens: FormattedTokenDisplay[],
    +nfts: FormattedNFTDisplay[],
|}

type State = {|
    +isOpen: boolean,
|}

export default class AssetsDropdown extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
      isOpen: false,
  }

  toggleDropdown(): void {
    const { isOpen } = this.state
    this.setState({ isOpen: !isOpen })
  }

  renderTokens(tokens: FormattedTokenDisplay[]): Node {
    return (
      tokens.map(token => (
        <div className={styles.token}>
          <div className={styles.label}>
            <DefaultAssetIcon />
            <p>{token.label}</p>
          </div>
          <p className={styles.amount}>{token.amount}</p>
        </div>
      ))
    )
  }

  renderNfts(nfts: FormattedNFTDisplay[]): Node {
    return (
      nfts.map(nft => {
        const image = nft.image != null ? nft.image.replace('ipfs://', '') : '';

        return (
          <div className={styles.nft}>
            <div className={styles.nftImg}>
              {image ? <img src={`https://ipfs.io/ipfs/${image}`} alt={nft.name} loading="lazy" /> : <DefaultNFTIcon />}
            </div>
            <p className={styles.name}>{nft.name}</p>
          </div>
        )
      })
    )
  }

  render(): Node {
    const { assets, tokens, nfts } = this.props
    const { isOpen } = this.state;
    const { intl } = this.context;
    return (
      <div className={styles.component}>
        <button type='button' onClick={() => this.toggleDropdown()} className={styles.header}>
          <p className={styles.title}>Assets</p>
          <div className={styles.headerRight}>
            <p className={styles.count}>{assets.length}</p>
            {
              isOpen ? <ArrowUpIcon /> : <ArrowDownIcon />
            }
          </div>
        </button>

        {isOpen &&
        <div className={styles.assetsList}>
          {
        tokens.length > 0 && (
          <div>
            <h1 className={styles.sectionLabel}>{intl.formatMessage(globalMessages.tokens)}</h1>
            <div>
              {this.renderTokens(tokens)}
            </div>
          </div>
        )
      }
          {
        nfts.length > 0 && (
          <div>
            <h1 className={styles.sectionLabel}>{intl.formatMessage(globalMessages.nfts)}</h1>
            <div>
              {this.renderNfts(nfts)}
            </div>
          </div>
        )
      }
        </div>}
      </div>
    )
  }
}