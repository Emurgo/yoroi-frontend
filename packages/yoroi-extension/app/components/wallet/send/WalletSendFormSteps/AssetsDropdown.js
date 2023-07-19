// @flow
import { Component } from 'react';
import type { Node } from 'react';
import styles from './AssetsDropdown.scss';
import { ReactComponent as DefaultAssetIcon } from '../../../../assets/images/assets-page/asset-no.inline.svg';
import { ReactComponent as ArrowUpIcon } from '../../../../assets/images/arrow-up.inline.svg';
import { ReactComponent as ArrowDownIcon } from '../../../../assets/images/arrow-down.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { FormattedNFTDisplay, FormattedTokenDisplay } from '../../../../utils/wallet';
import { NftImage } from '../../assets/NFTsList';
import { Box } from '@mui/material';

type Props = {|
  +tokens: FormattedTokenDisplay[],
  +nfts: FormattedNFTDisplay[],
|};

type State = {|
  +isOpen: boolean,
|};

export default class AssetsDropdown extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isOpen: false,
  };

  toggleDropdown(): void {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  renderTokens(tokens: FormattedTokenDisplay[]): Node {
    return tokens.map(token => (
      <div className={styles.token}>
        <div className={styles.label}>
          <DefaultAssetIcon />
          <p>{token.label}</p>
        </div>
        <p className={styles.amount}>{token.amount}</p>
      </div>
    ));
  }

  renderNfts(nfts: FormattedNFTDisplay[]): Node {
    return nfts.map(nft => {
      return (
        <div className={styles.nft}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <NftImage imageUrl={nft.image} name={nft.name} width="41px" height="44px" />
          </Box>
          <p className={styles.name}>{nft.name}</p>
        </div>
      );
    });
  }

  render(): Node {
    const { tokens, nfts } = this.props;
    const { isOpen } = this.state;
    const { intl } = this.context;
    return (
      <div className={styles.component}>
        <button type="button" onClick={() => this.toggleDropdown()} className={styles.header}>
          <p className={styles.title}>Assets</p>
          <div className={styles.headerRight}>
            <p className={styles.count}>{tokens.length + nfts.length}</p>
            {isOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </div>
        </button>

        {isOpen && (
          <div className={styles.assetsList}>
            {tokens.length > 0 && (
              <div>
                <h1 className={styles.sectionLabel}>{intl.formatMessage(globalMessages.tokens)}</h1>
                <div>{this.renderTokens(tokens)}</div>
              </div>
            )}
            {nfts.length > 0 && (
              <div>
                <h1 className={styles.sectionLabel}>{intl.formatMessage(globalMessages.nfts)}</h1>
                <div>{this.renderNfts(nfts)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
