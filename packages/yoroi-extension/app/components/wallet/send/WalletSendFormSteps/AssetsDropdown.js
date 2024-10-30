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
import { Box, Typography, styled } from '@mui/material';
import BigNumber from 'bignumber.js';
import { splitAmount } from '../../../../utils/formatters';

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

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
      const displayAmount = token.amount ? splitAmount(new BigNumber(token.amount), numberOfDecimals).join('') : '0';

      return (
        <div className={styles.token}>
          <div className={styles.label}>
            <IconWrapper>
              <DefaultAssetIcon />
            </IconWrapper>
            <Typography color="ds.text_gray_medium">{token.label}</Typography>
          </div>
          <Typography color="ds.text_gray_medium" className={styles.amount}>
            {displayAmount}
          </Typography>
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
          <Typography color="ds.text_gray_medium">{nft.name}</Typography>
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
            <button type="button" onClick={() => this.toggleDropdown('tokens')} className={styles.header}>
              <Typography component="div" fontWeight={500} variant="body1" color="ds.text_gray_medium">
                {intl.formatMessage(globalMessages.tokens)} ({tokens.length})
              </Typography>
              <div className={styles.headerRight}>
                {isTokensOpen ? (
                  <IconWrapper>
                    <ArrowUpIcon />
                  </IconWrapper>
                ) : (
                  <IconWrapper>
                    <ArrowDownIcon />
                  </IconWrapper>
                )}
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
            <button type="button" onClick={() => this.toggleDropdown('nfts')} className={styles.header}>
              <Typography component="div" fontWeight={500} variant="body1" color="ds.text_gray_medium">
                {intl.formatMessage(globalMessages.nfts)} ({nfts.length})
              </Typography>
              <div className={styles.headerRight}>
                {isNftsOpen ? (
                  <IconWrapper>
                    {' '}
                    <ArrowUpIcon />
                  </IconWrapper>
                ) : (
                  <IconWrapper>
                    {' '}
                    <ArrowDownIcon />
                  </IconWrapper>
                )}
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
