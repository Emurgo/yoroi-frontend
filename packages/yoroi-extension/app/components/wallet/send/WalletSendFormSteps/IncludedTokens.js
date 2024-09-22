// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { FormattedNFTDisplay, FormattedTokenDisplay } from '../../../../utils/wallet';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as NoAssetLogo } from '../../../../assets/images/assets-page/asset-no.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import { ReactComponent as RemoveIcon } from '../../../../assets/images/forms/close-small.inline.svg';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import NFTImage from './NFTImage';
import { Box, Typography, styled } from '@mui/material';
import { splitAmount } from '../../../../utils/formatters';
import BigNumber from 'bignumber.js';

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

type Props = {|
  +shouldSendAll: boolean,
  +onRemoveTokens: (Array<$ReadOnly<TokenRow>>) => void,
  +tokens: FormattedTokenDisplay[],
  +nfts: FormattedNFTDisplay[],
|};
export default class IncludedTokens extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  renderItems(items: FormattedNFTDisplay[] | FormattedTokenDisplay[]): Node {
    return items.map(item => {
      const numberOfDecimals = item.info?.Metadata.numberOfDecimals || 0;
      const displayAmount = item.amount ? splitAmount(new BigNumber(item.amount), numberOfDecimals).join('') : '0';

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            gap: '16px',
            position: 'relative',
          }}
          key={item.id}
        >
          <Box
            sx={{
              border: '2px solid',
              borderRadius: '8px',
              borderColor: 'grayscale.100',
              display: 'flex',
              alignItems: 'center',
              padding: '11px 16px',
              width: '100%',
            }}
          >
            {item.name && (
              <>
                <Box
                  mr="8px"
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
                    },
                  }}
                >
                  <NFTImage image={item.image ?? null} name={item.name} width="30px" height="30px" />
                </Box>
                <Box width="80%">
                  <Typography
                    component="div"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    justifySelf="flex-start"
                    variant="body1"
                    color="ds.text_gray_medium"
                  >
                    {item.name}
                  </Typography>
                </Box>
              </>
            )}

            {item.label && (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    '& svg': { width: '30px', height: '30px' },
                    width: '75%',
                  }}
                >
                  <NoAssetLogo />
                  <Typography
                    component="div"
                    variant="body1"
                    color="ds.text_gray_medium"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {item.label}
                  </Typography>
                </Box>
                <Box ml="auto" flexShrink={0}>
                  <Typography component="div" variant="body1" color="ds.text_gray_medium">
                    {displayAmount}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              right: '-48px',
            }}
          >
            {!this.props.shouldSendAll && (
              <Box
                sx={{
                  bgcolor: 'grayscale.50',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                }}
                component="button"
                type="button"
                onClick={() => this.props.onRemoveTokens([item.info])}
              >
                <IconWrapper>
                  <RemoveIcon />
                </IconWrapper>
              </Box>
            )}
          </Box>
        </Box>
      );
    });
  }

  render(): Node {
    const { intl } = this.context;
    const { tokens, nfts } = this.props;
    return (
      <Box mt="24px">
        {tokens.length > 0 && (
          <Box mb={nfts.length > 0 ? '24px' : '0px'}>
            <Typography component="div" variant="caption1" color="ds.text_gray_medium" mb="8px" sx={{ display: 'inline-block' }}>
              {intl.formatMessage(globalMessages.tokens)}
            </Typography>
            <Box>{this.renderItems(tokens)}</Box>
          </Box>
        )}

        {nfts.length > 0 && (
          <Box>
            <Typography component="div" variant="caption1" color="ds.text_gray_medium" mb="8px" sx={{ display: 'inline-block' }}>
              {intl.formatMessage(globalMessages.nfts)}
            </Typography>
            <Box>{this.renderItems(nfts)}</Box>
          </Box>
        )}
      </Box>
    );
  }
}
