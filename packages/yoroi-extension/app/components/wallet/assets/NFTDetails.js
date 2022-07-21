// @flow
import { Node, ComponentType, useState } from 'react';
import { Box, styled } from '@mui/system';
import { Link as LinkMui, Grid, Typography, Stack, Tab, Tabs, ThemeProvider, createTheme, Button } from '@mui/material';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import globalMessages from '../../../i18n/global-messages';
import { injectIntl, defineMessages } from 'react-intl';
import { ReactComponent as LinkSvg }  from '../../../assets/images/link.inline.svg';
import { ReactComponent as BackArrow }  from '../../../assets/images/assets-page/backarrow.inline.svg';
import { ReactComponent as IconCopy }  from '../../../assets/images/copy.inline.svg';
import { ReactComponent as IconCopied }  from '../../../assets/images/copied.inline.svg';

import moment from 'moment';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import CopyToClipboardText from '../../widgets/CopyToClipboardLabel';
import { getNetworkUrl, tokenMessages } from './TokenDetails';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { NftImage } from './NFTsList';
import CopyableAddress from '../../widgets/CopyableAddress';

// Overwrite primary current theme
// Temporary solution untill the new design system.
const theme = createTheme({
  palette: {
    primary: {
      main: '#3154CB'
    }
  }
});

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

const messages = defineMessages({
  back: {
    id: 'wallet.nftGallary.details.back',
    defaultMessage: '!!!back to gallery',
  },
  overview: {
    id: 'wallet.nftGallary.details.overview',
    defaultMessage: '!!!Overview'
  },
  metadata: {
    id: 'wallet.nftGallary.details.metadata',
    defaultMessage: '!!!Metadata'
  },
  copyMetadata: {
    id: 'wallet.nftGallary.details.copyMetadata',
    defaultMessage: '!!!Copy metadata'
  },
  missingMetadata: {
    id: 'wallet.nftGallary.details.missingMetadata',
    defaultMessage: '!!!Metadata is missing'
  }
})

function NFTDetails({ nftInfo, nftsCount, network, intl }: Props & Intl): Node {
  if (nftInfo == null) return null;
  const networkUrl = getNetworkUrl(network);
  const [value, setValue] = useState(1);
  const [isCopied, setCopy] = useState(false);

  const tabs = [
    {
      id: 0,
      label: intl.formatMessage(messages.overview),
    },
    {
      id: 1,
      label: intl.formatMessage(messages.metadata),
    },
  ];

  const onCopyMetadata = async () => {
    try {
      await navigator.clipboard.writeText(nftInfo.nftMetadata)
      setCopy(true)
    } catch (error) {
      setCopy(false)
    }
  }

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Box sx={{ display: 'inline-block' }}>
        <Typography
          as={Link}
          replace
          to={ROUTES.NFTS.ROOT}
          variant="h5"
          sx={{
            color: 'var(--yoroi-palette-gray-900)',
            textDecoration: 'none',
            marginTop: '5px',
            textTransform: 'capitalize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}
        >
          <BackArrow /> <Box component='span' marginLeft='10px'>{intl.formatMessage(messages.back)}</Box>
        </Typography>
      </Box>
      <Stack
        direction="row"
        sx={{
          margin: '0 auto',
          padding: '24px 0px',
          minHeight: '520px',
          marginY: '21px',
          backgroundColor: 'var(--yoroi-palette-common-white)',
          borderRadius: '8px',
        }}
      >
        <ImageItem flex="1" flexShrink={0}>
          <NftImage imageUrl={nftInfo.image} name={nftInfo.name} width='532px' height='510px' />
        </ImageItem>
        <Box flex="1" sx={{ width: '50%' }}>
          <Box px="24px" paddingBottom="22px">
            <Typography variant="h2" color="var(--yoroi-palette-gray-900)">
              {nftInfo.name}
            </Typography>
          </Box>
          <ThemeProvider theme={theme}>
            <TabContext value={value}>
              <Box>
                <TabList
                  sx={{
                    boxShadow: 'none',
                    borderRadius: '0px',
                    marginX: '24px',
                    borderBottom: 1,
                    borderColor: 'divider'
                  }}
                  onChange={(_, newValue) =>  setValue(newValue)}
                  aria-label="NFTs tabs"
                >
                  {tabs.map(({ label, id }) => (
                    <Tab sx={{ minWidth: 'unset', paddingX: '0px', width: 'content', marginRight: id === 0 && '24px', textTransform: 'none', fontWeight: 500 }} label={label} value={id} />
                  ))}
                </TabList>
              </Box>
              <TabPanel
                sx={{ boxShadow: 'none', bgcolor: 'transparent' }}
                value={0}
              >
                <Grid
                  container
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
                <Box>
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
                    <LabelWithValue label="Description" value={nftInfo.description || '-'} />
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel
                sx={{ boxShadow: 'none', bgcolor: 'transparent', height: '100%', maxHeight: '400px', overflow: 'auto' }}
                value={1}
              >
                {nftInfo.nftMetadata &&
                <Button
                  onClick={onCopyMetadata}
                  variant="text"
                  color='inherit'
                  sx={{ ml: '-8px', mb: '24px' }}
                  startIcon={isCopied ? <IconCopied /> : <IconCopy />}
                >
                  <Typography variant='h7' sx={{ textTransform: 'none' }}>
                    {intl.formatMessage(messages.copyMetadata)}
                  </Typography>
                </Button>}
                <Box component='pre'>
                  <Typography variant='body2' lineHeight='22px'>
                    {nftInfo.nftMetadata ?
                      JSON.stringify(nftInfo.nftMetadata, null, 2):
                      intl.formatMessage(messages.missingMetadata)}
                  </Typography>
                </Box>
              </TabPanel>
            </TabContext>
          </ThemeProvider>
        </Box>
      </Stack>
    </Box>
  );
}

export default (injectIntl(NFTDetails): ComponentType<Props>);

const ImageItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
