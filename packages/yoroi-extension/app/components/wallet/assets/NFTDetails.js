// @flow
import { Node, ComponentType, useState } from 'react';
import { Box, styled } from '@mui/system';
import { Link as LinkMui, Grid, Typography, Stack, Tab, Tabs, ThemeProvider, createTheme } from '@mui/material';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import globalMessages from '../../../i18n/global-messages';
import { injectIntl, defineMessages } from 'react-intl';
import { ReactComponent as LinkSvg }  from '../../../assets/images/link.inline.svg';
import { ReactComponent as BackArrow }  from '../../../assets/images/assets-page/backarrow.inline.svg';

import moment from 'moment';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import CopyToClipboardText from '../../widgets/CopyToClipboardLabel';
import { getNetworkUrl, tokenMessages } from './TokenDetails';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { NftImage } from './NFTsList';

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
})

function NFTDetails({ nftInfo, nftsCount, network, intl }: Props & Intl): Node {
  if (nftInfo == null) return null;
  const networkUrl = getNetworkUrl(network);
  const [value, setValue] = useState(0);
  const tabs = [
    {
      id: 0,
      label: 'Overview',
      component: <h1>TAB 1</h1>,
    },
    {
      id: 1,
      label: 'Metadata',
      component: <h1>TAB 2</h1>,
    },
  ];
  return (
    <Box>
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
        <ImageItem flex="1">
          <NftImage imageUrl={nftInfo.image} name={nftInfo.name} width='532px' height='510px' />
        </ImageItem>
        <Box flex="1">
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
                  }}
                  onChange={(_, newValue) =>  setValue(newValue)}
                  aria-label="NFTs tabs"
                >
                  {tabs.map(({ label, id }) => (
                    <Tab sx={{ minWidth: 'unset', paddingX: '0px', width: 'content', marginRight: id === 0 && '24px' }} label={label} value={id} />
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
                    <LabelWithValue label="Description" value={nftInfo.description || '-'} />
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel
                sx={{ boxShadow: 'none', bgcolor: 'transparent' }}
                value={1}
              >
                <Box component='pre'>
                  {JSON.stringify(nftInfo, null, 2)}
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
