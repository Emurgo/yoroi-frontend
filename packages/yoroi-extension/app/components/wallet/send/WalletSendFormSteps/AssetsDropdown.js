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
import { Box, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { splitAmount } from '../../../../utils/formatters';

type Props = {|
  +tokens: FormattedTokenDisplay[],
  +nfts: FormattedNFTDisplay[],
|};

type State = {|
  +isTokensOpen: boolean,
  +isNftsOpen: boolean,
|};

export default class AssetsDropdown extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isTokensOpen: false,
    isNftsOpen: false,
  };

  toggleDropdown(type: string): void {
    if (type === 'tokens') {
      this.setState(prevState => ({ ...prevState, isTokensOpen: !prevState.isTokensOpen }));
    }

    if (type === 'nfts') {
      this.setState(prevState => ({ ...prevState, isNftsOpen: !prevState.isNftsOpen }));
    }
  }

  renderTokens(tokens: FormattedTokenDisplay[]): Node {
    return tokens.map(token => {
      const numberOfDecimals = token.info?.Metadata.numberOfDecimals || 0;
      const displayAmount = token.amount
        ? splitAmount(new BigNumber(token.amount), numberOfDecimals).join('')
        : '0';

      return (
        <div className={styles.token}>
          <div className={styles.label}>
            <DefaultAssetIcon />
            <div>{token.label}</div>
          </div>
          <div className={styles.amount}>{displayAmount}</div>
        </div>
      );
    });
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
              '& img': {
                borderRadius: '8px',
                overflow: 'hidden',
              },
            }}
          >
            <NftImage imageUrl={nft.image} name={nft.name} width="41px" height="44px" />
          </Box>
          <div className={styles.name}>{nft.name}</div>
        </div>
      );
    });
  }

  render(): Node {
    const { tokens, nfts } = this.props;
    const { isTokensOpen, isNftsOpen } = this.state;
    const { intl } = this.context;
    return (
      <div className={styles.component}>
        {tokens.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => this.toggleDropdown('tokens')}
              className={styles.header}
            >
              <Typography component="div" fontWeight={500} variant="body1" color="grayscale.700">
                {intl.formatMessage(globalMessages.tokens)} ({tokens.length})
              </Typography>
              <div className={styles.headerRight}>
                {isTokensOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </div>
            </button>
            {isTokensOpen && (
              <div className={styles.assetsList}>
                <div>
                  <div>{this.renderTokens(tokens)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {nfts.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => this.toggleDropdown('nfts')}
              className={styles.header}
            >
              <Typography component="div" fontWeight={500} variant="body1" color="grayscale.700">
                {intl.formatMessage(globalMessages.nfts)} ({nfts.length})
              </Typography>
              <div className={styles.headerRight}>
                {isNftsOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </div>
            </button>

            {isNftsOpen && (
              <div className={styles.assetsList}>
                <div>
                  <div>{this.renderNfts(nfts)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
