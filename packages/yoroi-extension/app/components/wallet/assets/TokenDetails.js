// @flow
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import { Avatar, Link as LinkMui, Grid, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { defineMessages, injectIntl } from 'react-intl';
import { ReactComponent as NoAssetLogo }  from '../../../assets/images/assets-page/asset-no.inline.svg';
import { ReactComponent as LinkSvg }  from '../../../assets/images/link.inline.svg';
import moment from 'moment';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { assetsMessage } from './AssetsList';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import {
  isCardanoHaskell,
  isErgo,
  isTestnet,
} from '../../../api/ada/lib/storage/database/prepackaged/networks';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { CopyAddress } from './NFTDetails';

type Props = {|
  tokenInfo: void | {|
    policyId: string,
    lastUpdatedAt: any,
    ticker: string,
    assetName: string,
    name: string,
    id: string,
    amount: string,
    description: string | null,
  |},
  tokensCount: number,
  network: $ReadOnly<NetworkRow>,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

export const tokenMessages: Object = defineMessages({
  ticker: {
    id: 'wallet.assets.ticker',
    defaultMessage: '!!!Ticker',
  },
  created: {
    id: 'wallet.assets.created',
    defaultMessage: '!!!Created',
  },
  details: {
    id: 'wallet.assets.details',
    defaultMessage: '!!!Details',
  },
  detailsOn: {
    id: 'wallet.assets.detailsOn',
    defaultMessage: '!!!Details on',
  },
  policyId: {
    id: 'wallet.assets.policyId',
    defaultMessage: '!!!Policy ID',
  },
  identifier: {
    id: 'wallet.assets.identifier',
    defaultMessage: '!!!Identifier',
  },
  description: {
    id: 'wallet.nftGallary.details.description',
    defaultMessage: '!!!Description'
  },
});

export const getNetworkUrl: ($ReadOnly<NetworkRow>) => string | void = network => {
  if (isErgo(network)) {
    return;
  }
  if (isCardanoHaskell(network) && !isTestnet(network)) {
    return 'https://cardanoscan.io/token';
  }
  return 'https://testnet.cardanoscan.io/token';
};

function TokenDetails({ tokenInfo, tokensCount, network, intl }: Props & Intl): Node {
  if (tokenInfo == null) return null;
  const networkUrl = getNetworkUrl(network);

  return (
    <Box>
      <Box
        borderBottom="1px solid var(--yoroi-palette-gray-200)"
        padding="16px 24px"
        backgroundColor="var(--yoroi-palette-common-white)"
      >
        <Typography variant="h5" color="var(--yoroi-palette-gray-600)">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <Typography
            as={Link}
            replace
            to={ROUTES.ASSETS.ROOT}
            variant="h5"
            sx={{
              color: 'var(--yoroi-palette-gray-600)',
              textDecoration: 'none',
            }}
          >
            {intl.formatMessage(globalMessages.tokens)}({tokensCount})
          </Typography>
          <Typography as="span" variant="h5" color="var(--yoroi-palette-gray-900)" ml="4px">
            / {tokenInfo.name}
          </Typography>
        </Typography>
      </Box>
      <Box sx={{ maxWidth: '562px', margin: '0 auto', py: '24px', paddingTop: '57px' }}>
        <Box
          display="flex"
          alignItems="center"
          borderBottom="1px solid var(--yoroi-palette-gray-50)"
          py="20px"
        >
          <Avatar variant="round" sx={{ background: 'white', marginRight: '18px' }}>
            <NoAssetLogo />
          </Avatar>
          <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
            {tokenInfo.name}
          </Typography>
        </Box>
        <Box borderBottom="1px solid var(--yoroi-palette-gray-50)" py="32px">
          <Typography variant="body1" color="var(--yoroi-palette-gray-600)">
            {intl.formatMessage(assetsMessage.quantity)}
          </Typography>
          <Typography variant="h3" fontWeight="500" color="var(--yoroi-palette-gray-900)" mt="6px">
            {tokenInfo.amount}
          </Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          mt="26px"
          py="20px"
          borderBottom="1px solid var(--yoroi-palette-gray-50)"
        >
          <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
            {intl.formatMessage(tokenMessages.details)}
          </Typography>
        </Box>
        <Grid
          container
          paddingTop="32px"
          paddingBottom="24px"
          borderBottom="1px solid var(--yoroi-palette-gray-50)"
        >
          <Grid item xs={4}>
            <LabelWithValue
              label={intl.formatMessage(tokenMessages.ticker)}
              value={tokenInfo.ticker}
            />
          </Grid>
          <Grid item xs={4}>
            {/* TODO: replace with created date */}
            <LabelWithValue
              label={intl.formatMessage(tokenMessages.created)}
              value={tokenInfo.lastUpdatedAt ? moment(tokenInfo.lastUpdatedAt).format('LL') : '-'}
            />
          </Grid>
          {isCardanoHaskell(network) &&
          <Grid item xs={4}>
            <LabelWithValue
              label={
                <>
                  <Typography as="span" display="flex">
                    {intl.formatMessage(tokenMessages.detailsOn)}
                    <Typography as="span" ml="4px">
                      <LinkSvg />
                    </Typography>
                  </Typography>
                </>
              }
              value={
                <LinkMui
                  target="_blank"
                  href={
                    networkUrl != null
                      ? `${networkUrl}/${tokenInfo.policyId}${tokenInfo.assetName}`
                      : ''
                  }
                  disabled={networkUrl === null}
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none' }}
                >
                  {intl.formatMessage(globalMessages.cardanoscan)}
                </LinkMui>
              }
            />
          </Grid>}
        </Grid>
        <Box marginTop="22px">
          <LabelWithValue
            label={intl.formatMessage(globalMessages.fingerprint)}
            value={
              <CopyAddress text={tokenInfo.policyId}>
                {tokenInfo.policyId}
              </CopyAddress>
            }
          />
        </Box>
        <Box marginTop="22px">
          <LabelWithValue
            label={intl.formatMessage(tokenMessages.policyId)}
            value={
              <CopyAddress text={tokenInfo.policyId}>
                {tokenInfo.policyId}
              </CopyAddress>
            }
          />
        </Box>

        {tokenInfo.description &&
        <Box marginTop="22px">
          <LabelWithValue
            label={intl.formatMessage(tokenMessages.description)}
            value={tokenInfo.description}
          />
        </Box>}
      </Box>
    </Box>
  );
}

export default (injectIntl(TokenDetails): ComponentType<Props>);

function LabelWithValue({ label, value }: {| label: string | Node, value: string | Node |}): Node {
  return (
    <Box>
      <Typography color="var(--yoroi-palette-gray-600)">{label}</Typography>
      <Typography color="var(--yoroi-palette-gray-900)">{value}</Typography>
    </Box>
  );
}
