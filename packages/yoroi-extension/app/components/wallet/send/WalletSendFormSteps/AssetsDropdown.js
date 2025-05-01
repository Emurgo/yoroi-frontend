// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { ReactComponent as ArrowUpIcon } from '../../../../assets/images/arrow-up.inline.svg';
import { ReactComponent as ArrowDownIcon } from '../../../../assets/images/arrow-down.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import { IntlContext } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { FormattedNFTDisplay, FormattedTokenDisplay } from '../../../../utils/wallet';
import { Box, Typography, styled } from '@mui/material';
import BigNumber from 'bignumber.js';
import { splitAmount } from '../../../../utils/formatters';
import TokenImage from './TokenImage';
import NFTImage from './NFTImage';

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

type ToggableBoxProps = {|
  onClick?: () => void,
  toggleTitle: string,
  isOpen: boolean,
  renderedAssets: Node,
|};

const AssetToggableBox = (props: ToggableBoxProps): Node => {
  const { onClick, toggleTitle, isOpen, renderedAssets } = props;
  return (
    <Box>
      <Box
        type="button"
        onClick={onClick}
        width="100%"
        padding="4px 0px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          cursor: 'pointer',
        }}
      >
        <Typography component="div" fontWeight={500} variant="body1" color="ds.text_gray_medium">
          {toggleTitle}
        </Typography>
        <AssetToggableArrowBox isOpen={isOpen} />
      </Box>
      {isOpen && (
        <Box marginTop="24px">
          <Box>{renderedAssets}</Box>
        </Box>
      )}
    </Box>
  );
};

type ToggableProps = {|
  +isOpen: boolean,
|};

const AssetToggableArrowBox = ({ isOpen }: ToggableProps): Node => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      {isOpen ? (
        <IconWrapper>
          <ArrowUpIcon />
        </IconWrapper>
      ) : (
        <IconWrapper>
          <ArrowDownIcon />
        </IconWrapper>
      )}
    </Box>
  );
};

type AssetRowProps = {|
  +assetsTypes: string,
  +children?: Node,
|};

const AssetRowBox = (props: AssetRowProps): Node => {
  const { assetsTypes, children } = props;
  const isTokens = assetsTypes === 'tokens';
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent={isTokens ? 'space-between' : 'flex-start'}
      height="56px"
      border="2px solid"
      borderColor="ds.gray_200"
      borderRadius="8px"
      px="16px"
      py="13px"
      marginBottom="8px"
    >
      {children}
    </Box>
  );
};

type Props = {|
  +tokens: FormattedTokenDisplay[],
  +nfts: FormattedNFTDisplay[],
|};

type State = {|
  +isTokensOpen: boolean,
  +isNftsOpen: boolean,
|};

export default class AssetsDropdown extends Component<Props, State> {
  static contextType = IntlContext;
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
        <Box key={token.id}>
          <AssetRowBox assetsTypes="tokens">
            <Box display="flex" alignItems="center" justifyContent="flex-start" gap="8px">
              <Box
                width={30}
                height={30}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  '> img': {
                    objectFit: 'cover',
                    display: 'inline-block',
                    borderRadius: '4px',
                  },
                }}
              >
                <TokenImage image={token.info?.Metadata.logo ?? null} name={token.label} width="30px" height="30px" />
              </Box>
              <Typography
                component="div"
                variant="body1"
                color="ds.text_gray_medium"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {token.label}
              </Typography>
            </Box>
            <Typography color="ds.text_gray_medium">{displayAmount}</Typography>
          </AssetRowBox>
        </Box>
      );
    });
  }

  renderNfts(nfts: FormattedNFTDisplay[]): Node {
    return nfts.map(nft => {
      return (
        <Box key={nft.name}>
          <AssetRowBox assetsTypes="nfts">
            <Box display="flex" alignItems="center" justifyContent="flex-start" gap="8px">
              <Box
                width={30}
                height={30}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  '> img': {
                    objectFit: 'cover',
                    display: 'inline-block',
                    borderRadius: '4px',
                  },
                }}
              >
                <NFTImage image={nft.image} name={nft.name} width="30px" height="30px" />
              </Box>
              <Typography color="ds.text_gray_medium">{nft.name}</Typography>
            </Box>
          </AssetRowBox>
        </Box>
      );
    });
  }

  render(): Node {
    const { tokens, nfts } = this.props;
    const { isTokensOpen, isNftsOpen } = this.state;
    const intl = this.context;
    const tokensToggleBoxTitle = `${intl.formatMessage(globalMessages.tokens)} (${tokens.length})`;
    const nftsToggleBoxTitle = `${intl.formatMessage(globalMessages.nfts)} (${nfts.length})`;
    return (
      <Box my="24px" display="flex" flexDirection="column" gap="24px">
        {tokens.length > 0 && (
          <AssetToggableBox
            isOpen={isTokensOpen}
            onClick={() => this.toggleDropdown('tokens')}
            toggleTitle={tokensToggleBoxTitle}
            renderedAssets={this.renderTokens(tokens)}
          />
        )}

        {nfts.length > 0 && (
          <AssetToggableBox
            isOpen={isNftsOpen}
            onClick={() => this.toggleDropdown('nfts')}
            toggleTitle={nftsToggleBoxTitle}
            renderedAssets={this.renderNfts(nfts)}
          />
        )}
      </Box>
    );
  }
}
