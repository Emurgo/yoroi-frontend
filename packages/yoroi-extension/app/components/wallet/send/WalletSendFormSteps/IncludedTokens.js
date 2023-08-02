// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { FormattedNFTDisplay, FormattedTokenDisplay } from '../../../../utils/wallet';
import styles from './IncludedTokens.scss';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as NoAssetLogo } from '../../../../assets/images/assets-page/asset-no.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import { ReactComponent as RemoveIcon } from '../../../../assets/images/forms/close-small.inline.svg';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import NFTImage from './NFTImage';
import { Box, Typography } from '@mui/material';
import { splitAmount } from '../../../../utils/formatters';
import BigNumber from 'bignumber.js';

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
      const displayAmount = item.amount
        ? splitAmount(new BigNumber(item.amount), numberOfDecimals).join('')
        : '0';

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            gap: '16px',
          }}
          key={`${item.name}-${item.label}`}
        >
          <Box
            sx={{
              border: '2px solid',
              borderRadius: '8px',
              borderColor: 'grayscale.100',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '11px 16px',
              maxWidth: '246px',
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
                  <NFTImage
                    image={item.image ?? null}
                    name={item.name}
                    width="30px"
                    height="30px"
                  />
                </Box>
                <Box width="80%">
                  <Typography
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    justifySelf="flex-start"
                    variant="body1"
                    color="grayscale.max"
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
                    variant="body1"
                    color="grayscale.max"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {item.label}
                  </Typography>
                </Box>
                <Box ml="auto" flexShrink={0}>
                  <Typography variant="body1" color="grayscale.max">
                    {displayAmount}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          <div>
            {!this.props.shouldSendAll && (
              <Box
                sx={{ bgcolor: 'grayscale.50', width: '32px', height: '32px', borderRadius: '50%' }}
                component="button"
                type="button"
                onClick={() => this.props.onRemoveTokens([item.info])}
              >
                <RemoveIcon />
              </Box>
            )}
          </div>
        </Box>
      );
    });
  }

  render(): Node {
    const { intl } = this.context;
    const { tokens, nfts } = this.props;
    return (
      <div className={styles.component}>
        {tokens.length > 0 && (
          <div>
            <h1 className={styles.header}>{intl.formatMessage(globalMessages.tokens)}</h1>
            <div>{this.renderItems(tokens)}</div>
          </div>
        )}
        {nfts.length > 0 && (
          <div>
            <h1 className={styles.header}>{intl.formatMessage(globalMessages.nfts)}</h1>
            <div>{this.renderItems(nfts)}</div>
          </div>
        )}
      </div>
    );
  }
}
