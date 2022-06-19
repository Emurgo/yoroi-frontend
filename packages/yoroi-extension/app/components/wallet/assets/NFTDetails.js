// @flow
import type { Node, ComponentType } from 'react';
import { Box, styled } from '@mui/system';
import { Link as LinkMui, Grid, Typography, Stack } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { injectIntl } from 'react-intl';
import { ReactComponent as LinkSvg }  from '../../../assets/images/link.inline.svg';
import moment from 'moment';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import CopyToClipboardText from '../../widgets/CopyToClipboardLabel';
import { getNetworkUrl, tokenMessages } from './TokenDetails';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  nftInfo: void | {|
    policyId: string,
    lastUpdatedAt: any,
    ticker: string,
    assetName: string,
    name: string | void,
    id: string,
    amount: string,
    image?: string,
    description?: string
  |},
  network: $ReadOnly<NetworkRow>,
  nftsCount: number
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function NFTDetails({ nftInfo, nftsCount, network, intl }: Props & Intl): Node {
  if (nftInfo == null) return null;
  const ipfsHash = nftInfo.image != null ? nftInfo.image.replace('ipfs://', '') : '';
  const networkUrl = getNetworkUrl(network);

  return (
    <Box>
      <Box>
        <Typography variant="h5" color="var(--yoroi-palette-gray-600)">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <Typography
            as={Link}
            replace
            to={ROUTES.NFTS.ROOT}
            variant="h5"
            sx={{
              color: 'var(--yoroi-palette-gray-600)',
              textDecoration: 'none',
            }}
          >
            NFTs ({nftsCount}){' '}/{' '}
          </Typography>
          <Typography as="span" variant="h5" color="var(--yoroi-palette-gray-900)" ml="4px">
            {nftInfo.name}
          </Typography>
        </Typography>
      </Box>
      <Stack
        spacing={5}
        direction="row"
        sx={{
          margin: '0 auto',
          py: '24px',
          minHeight: '520px',
          paddingTop: '57px',
        }}
      >
        <ImageItem flex="1">
          <img src={`https://ipfs.io/ipfs/${ipfsHash}`} alt={nftInfo.name} loading="lazy" />
        </ImageItem>
        <Box flex="1" backgroundColor="var(--yoroi-palette-common-white)" borderRadius="8px">
          <Box borderBottom="1px solid var(--yoroi-palette-gray-50)" px="24px" py="22px">
            <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
              {nftInfo.name}
            </Typography>
          </Box>
          <Grid
            container
            paddingTop="30px"
            paddingBottom="22px"
            px="24px"
            borderBottom="1px solid var(--yoroi-palette-gray-50)"
          >
            <Grid item xs={4}>
              <LabelWithValue
                label={intl.formatMessage(tokenMessages.ticker)}
                value={nftInfo.ticker}
              />
            </Grid>
            <Grid item xs={4}>
              {/* TODO: replace with created date */}
              <LabelWithValue
                label={intl.formatMessage(tokenMessages.created)}
                value={nftInfo.lastUpdatedAt ? moment(nftInfo.lastUpdatedAt).format('LL') : '-'}
              />
            </Grid>
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
                      networkUrl != null && `${networkUrl}/${nftInfo.policyId}${nftInfo.assetName}`
                    }
                    disabled={networkUrl === null}
                    rel="noopener noreferrer"
                    sx={{ textDecoration: 'none' }}
                  >
                    Cardanoscan
                  </LinkMui>
                }
              />
            </Grid>
          </Grid>
          <Box p="24px">
            <LabelWithValue
              label={intl.formatMessage(globalMessages.fingerprint)}
              value={
                <CopyToClipboardText text={nftInfo.id}>{nftInfo.id}</CopyToClipboardText>
              }
            />
            <Box marginTop="22px">
              <LabelWithValue
                label={intl.formatMessage(tokenMessages.policyId)}
                value={
                  <CopyToClipboardText text={nftInfo.policyId}>
                    {nftInfo.policyId}
                  </CopyToClipboardText>
                }
              />
            </Box>
            <Box marginTop="22px">
              <LabelWithValue label="Description" value={nftInfo.description ?? ''} />
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

export default (injectIntl(NFTDetails): ComponentType<Props>);

const ImageItem = styled(Box)({
  padding: '40px',
  backgroundColor: 'var(--yoroi-palette-common-white)',
  borderRadius: '8px',
  img: {
    margin: '0 auto',
    overflow: 'hidden',
    display: 'block',
    maxWidth: '365px',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  },
});

function LabelWithValue({ label, value }: {| label: string | Node, value: string | Node |}): Node {
  return (
    <Box>
      <Typography color="var(--yoroi-palette-gray-600)">{label}</Typography>
      <Typography color="var(--yoroi-palette-gray-900)">{value}</Typography>
    </Box>
  );
}
