// @flow
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import { Link as LinkMui, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { defineMessages, injectIntl } from 'react-intl';
import { ReactComponent as ArrowLeft } from '../../../assets/images/assets-page/back-arrow.inline.svg';
import moment from 'moment';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { assetsMessage } from './AssetsList';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import {
  isTestnet,
} from '../../../api/ada/lib/storage/database/prepackaged/networks';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { CopyAddress } from './TruncatedText';

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
    defaultMessage: '!!!Description',
  },
  back: {
    id: 'wallet.assets.details.back',
    defaultMessage: '!!!Back to assets',
  },
});

export const getNetworkUrl: ($ReadOnly<NetworkRow>) => string | void = network => {
  return isTestnet(network)
    ? 'https://testnet.cardanoscan.io/token'
    : 'https://cardanoscan.io/token';
};

function TokenDetails({ tokenInfo, network, intl }: Props & Intl): Node {
  if (tokenInfo == null) return null;
  const networkUrl = getNetworkUrl(network);

  return (
    <Box>
      <Box backgroundColor="common.white">
        <Typography
          as={Link}
          replace
          to={ROUTES.ASSETS.ROOT}
          variant="h5"
          color="grayscale.900"
          fontWeight={500}
          fontSize="18px"
          sx={{
            textDecoration: 'none',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            lineHeight: '27px',
            textTransform: 'uppercase',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: '1px',
            }}
          >
            <ArrowLeft />
          </Box>
          {intl.formatMessage(tokenMessages.back)}
        </Typography>
      </Box>
      <Box
        sx={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          gap: '24px',
          height: '100%',
        }}
      >
        <Box display="flex" alignItems="center" py="20px">
          <Typography component="div" variant="h2" fontWeight={500} color="common.black">
            {tokenInfo.name}
          </Typography>
        </Box>
        <Box>
          <Typography component="div" variant="body1" color="grayscale.600">
            {intl.formatMessage(assetsMessage.quantity)}
          </Typography>
          <Typography component="div" variant="body1" color="grayscale.900" mt="6px">
            {tokenInfo.amount}
          </Typography>
        </Box>

        {tokenInfo.description && (
          <Box>
            <LabelWithValue
              label={intl.formatMessage(tokenMessages.details)}
              value={tokenInfo.description}
            />
          </Box>
        )}

        <LabelWithValue label={intl.formatMessage(tokenMessages.ticker)} value={tokenInfo.ticker} />

        <LabelWithValue
          label={intl.formatMessage(tokenMessages.created)}
          value={tokenInfo.lastUpdatedAt ? moment(tokenInfo.lastUpdatedAt).format('LL') : '-'}
        />

        <LabelWithValue
          label={intl.formatMessage(globalMessages.fingerprint)}
          value={
            <Box
              sx={{
                '& > div': {
                  justifyContent: 'flex-start',
                  gap: '5px',
                  '& > p': {
                    width: 'unset',
                  },
                },
              }}
            >
              <CopyAddress text={tokenInfo.id}>{tokenInfo.id}</CopyAddress>
            </Box>
          }
        />

        <LabelWithValue
          label={intl.formatMessage(tokenMessages.policyId)}
          value={
            <Box
              sx={{
                '& > div': {
                  justifyContent: 'flex-start',
                  gap: '5px',
                  '& > p': {
                    width: 'unset',
                  },
                },
              }}
            >
              <CopyAddress text={tokenInfo.policyId}>{tokenInfo.policyId}</CopyAddress>
            </Box>
          }
        />

        <Box>
          <Typography component="div" variant="body1" color="grayscale.600">
            {intl.formatMessage(tokenMessages.detailsOn)}
          </Typography>
          <Typography component="div" variant="body1" color="grayscale.900" mt="6px">
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
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default (injectIntl(TokenDetails): ComponentType<Props>);

function LabelWithValue({ label, value }: {| label: string | Node, value: string | Node |}): Node {
  return (
    <Box>
      <Typography component="div" color="grayscale.600">{label}</Typography>
      <Typography component="div" color="grayscale.900">{value}</Typography>
    </Box>
  );
}
