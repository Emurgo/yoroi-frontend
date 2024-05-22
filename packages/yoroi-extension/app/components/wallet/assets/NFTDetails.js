// @flow
import type { ComponentType, Node } from 'react';
import { useState } from 'react';
import { Box, styled } from '@mui/system';
import {
  Link as LinkMui,
  Typography,
  Stack,
  Tab,
  Modal,
  Button,
  IconButton,
  Grid,
} from '@mui/material';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { ReactComponent as BackArrow } from '../../../assets/images/assets-page/backarrow.inline.svg';
import { ReactComponent as IconCopy } from '../../../assets/images/copy.inline.svg';
import { ReactComponent as IconCopied } from '../../../assets/images/copied.inline.svg';
import { ReactComponent as Chevron } from '../../../assets/images/assets-page/chevron-right.inline.svg';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import { getNetworkUrl, tokenMessages } from './TokenDetails';
import type {
  CardanoAssetMintMetadata,
  NetworkRow,
} from '../../../api/ada/lib/storage/database/primitives/tables';
import { NftImage } from './NFTsList';
import { isCardanoHaskell } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { truncateAddress, truncateAddressShort } from '../../../utils/formatters';
import { urlResolveForIpfsAndCorsproxy } from '../../../coreUtils';
import { ampli } from '../../../../ampli/index';
import { CopyAddress, TruncatedText } from './TruncatedText';

type Props = {|
  nftInfo: void | {
    policyId: string,
    ticker: string,
    assetName: string,
    name: string | void,
    id: string,
    image: string | null,
    description: ?string,
    author: ?string,
    metadata: CardanoAssetMintMetadata | null,
    ...
  },
  network: $ReadOnly<NetworkRow>,
  nextNftId: string,
  prevNftId: string,
  tab: string | null,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages: Object = defineMessages({
  back: {
    id: 'wallet.nftGallary.details.back',
    defaultMessage: '!!!back to gallery',
  },
  overview: {
    id: 'wallet.nftGallary.details.overview',
    defaultMessage: '!!!Overview',
  },
  metadata: {
    id: 'wallet.nftGallary.details.metadata',
    defaultMessage: '!!!Metadata',
  },
  copyMetadata: {
    id: 'wallet.nftGallary.details.copyMetadata',
    defaultMessage: '!!!Copy metadata',
  },
  missingMetadata: {
    id: 'wallet.nftGallary.details.missingMetadata',
    defaultMessage: '!!!Metadata is missing',
  },
  description: {
    id: 'wallet.nftGallary.details.description',
    defaultMessage: '!!!Description',
  },
  author: {
    id: 'wallet.nftGallary.details.author',
    defaultMessage: '!!!Author',
  },
});

const tabs = [
  {
    id: 'overview',
    label: messages.overview,
  },
  {
    id: 'metadata',
    label: messages.metadata,
  },
];

function NFTDetails({ nftInfo, network, intl, nextNftId, prevNftId, tab }: Props & Intl): Node {
  const nftImage = nftInfo?.image;
  const networkUrl = getNetworkUrl(network);
  const [activeTab, setActiveTab] = useState(tab !== null ? tab : tabs[0].id); // Overview tab
  const setActiveTabAndTrack = function (tabId: string) {
    setActiveTab(tabId);
    ampli.nftGalleryDetailsTab({
      nft_tab: tabId === 'overview' ? 'Overview' : 'Metadata',
    });
  };
  const [open, setOpen] = useState(false);
  const [isCopied, setCopy] = useState(false);
  const below1400 = useMediaQuery('(max-width:1400px)');
  const below1250 = useMediaQuery('(max-width:1250px)');

  const onCopyMetadata = async () => {
    if (nftInfo?.metadata == null) return;

    setCopy(false);
    try {
      await navigator.clipboard.writeText(JSON.stringify(nftInfo.metadata, null, 2));
      setCopy(true);
    } catch (error) {
      setCopy(false);
    }
  };
  const onClose = () => setOpen(false);
  const setOpenAndTrack = () => {
    setOpen(true);
    ampli.nftGalleryDetailsImageViewed();
  };
  function displayAddr(addr: string): string {
    if (below1250 === true) {
      return truncateAddressShort(addr);
    }

    if (below1400 === true) {
      return truncateAddress(addr);
    }

    return addr;
  }
  // Todo: Should be handling by displaying an error page
  if (nftInfo == null) return null;

  return (
    <Box sx={{ p: '24px', width: '100%' }}>
      <Button
        LinkComponent={Link}
        to={ROUTES.NFTS.ROOT}
        sx={{
          color: 'grayscale.900',
          '&.MuiButton-sizeMedium': {
            padding: '13px 16px',
          },
        }}
        startIcon={<BackArrow />}
      >
        <Typography fontWeight="500">{intl.formatMessage(messages.back)}</Typography>
      </Button>
      <Grid
        container
        columns={10}
        sx={{
          margin: '0 auto',
          minHeight: '400px',
          backgroundColor: 'common.white',
          borderRadius: '8px',
        }}
      >
        <Grid item xs={4}>
          <ImageItem
            sx={{
              cursor: nftImage !== null ? 'zoom-in' : 'auto',
              paddingY: '24px',
              display: 'block',
              img: {
                objectFit: 'unset',
              },
            }}
            onClick={() => nftImage !== null && setOpenAndTrack()}
          >
            <NftImage imageUrl={nftImage} name={nftInfo.name || '-'} width="100%" height="auto" />
          </ImageItem>
        </Grid>

        <Grid
          item
          xs={6}
          sx={{
            paddingTop: '16px',
            paddingBottom: '22px',
          }}
        >
          <Box>
            <Stack
              justifyContent="space-between"
              flexDirection="row"
              sx={{
                paddingBottom: '22px',
                px: '24px',
                height: '100%',
              }}
            >
              <Box>
                <TruncatedText
                  variant="h2"
                  fontWeight={500}
                  sx={{ width: below1400 ? '200px' : '400px' }}
                  color="common.black"
                >
                  {nftInfo.name}
                </TruncatedText>
              </Box>

              <Stack direction="row" spacing={1}>
                <Link
                  to={ROUTES.NFTS.DETAILS.replace(':nftId', prevNftId) + `?tab=${activeTab}`}
                  onClick={() => {
                    ampli.nftGalleryDetailsNavigation({
                      nft_navigation: 'Previous',
                    });
                  }}
                >
                  <IconButton
                    aria-label="Previous"
                    sx={{ transform: 'rotate(180deg)', width: '32px' }}
                  >
                    <Chevron />
                  </IconButton>
                </Link>
                <Link
                  to={ROUTES.NFTS.DETAILS.replace(':nftId', nextNftId) + `?tab=${activeTab}`}
                  onClick={() => {
                    ampli.nftGalleryDetailsNavigation({
                      nft_navigation: 'Next',
                    });
                  }}
                >
                  <IconButton aria-label="Next" sx={{ width: '32px' }}>
                    <Chevron />
                  </IconButton>
                </Link>
              </Stack>
            </Stack>
          </Box>
          <TabContext value={activeTab}>
            <Box>
              <TabList
                sx={{
                  boxShadow: 'none',
                  borderRadius: '0px',
                  marginX: '24px',
                  borderBottom: 1,
                  borderColor: 'divider',
                  '.MuiTab-root': {
                    paddingX: '0px',
                    mr: '24px',
                  },
                }}
                onChange={(_, newValue) => setActiveTabAndTrack(newValue)}
                aria-label="NFTs tabs"
              >
                {tabs.map(({ label, id }) => (
                  <Tab
                    key={id}
                    sx={{
                      minWidth: 'unset',
                      width: 'content',
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                    label={
                      <Typography variant="body1" fontWeight="500" pb="6px">
                        {intl.formatMessage(label)}
                      </Typography>
                    }
                    value={id}
                    disableRipple
                  />
                ))}
              </TabList>
            </Box>
            <TabPanel
              sx={{
                boxShadow: 'none',
                paddingBottom: '0px',
                bgcolor: 'transparent',
                maxHeight: '400px',
                overflow: 'auto',
              }}
              value={tabs[0].id}
            >
              <Stack spacing="24px">
                <LabelWithValue
                  label={intl.formatMessage(messages.description)}
                  value={nftInfo.description || '-'}
                />
                <LabelWithValue
                  label={intl.formatMessage(messages.author)}
                  value={nftInfo.author || '-'}
                />
                <LabelWithValue
                  label={intl.formatMessage(globalMessages.fingerprint)}
                  value={<CopyAddress text={nftInfo.id}>{displayAddr(nftInfo.id)}</CopyAddress>}
                />

                <LabelWithValue
                  label={intl.formatMessage(tokenMessages.policyId)}
                  value={
                    <CopyAddress text={nftInfo.policyId}>
                      {displayAddr(nftInfo.policyId)}
                    </CopyAddress>
                  }
                />

                {isCardanoHaskell(network) && (
                  <LabelWithValue
                    label={
                      <Typography as="span" display="flex">
                        {intl.formatMessage(tokenMessages.detailsOn)}
                      </Typography>
                    }
                    value={
                      <LinkMui
                        target="_blank"
                        href={
                          networkUrl != null &&
                          `${networkUrl}/${nftInfo.policyId}${nftInfo.assetName}`
                        }
                        disabled={networkUrl == null}
                        rel="noopener noreferrer"
                        sx={{ textDecoration: 'none' }}
                      >
                        {intl.formatMessage(globalMessages.cardanoscan)}
                      </LinkMui>
                    }
                  />
                )}
              </Stack>
            </TabPanel>

            <TabPanel
              sx={{
                boxShadow: 'none',
                bgcolor: 'transparent',
                overflow: 'auto',
              }}
              value={tabs[1].id}
            >
              {nftInfo.metadata && (
                <Button
                  onClick={onCopyMetadata}
                  color="inherit"
                  sx={{
                    ml: '-8px',
                    mb: '24px',
                    fontSize: '14px',
                    color: 'grayscale.900',
                  }}
                  endIcon={isCopied ? <IconCopied /> : <IconCopy />}
                >
                  {intl.formatMessage(messages.copyMetadata)}
                </Button>
              )}
              <Typography component="pre" variant="body3" lineHeight="22px" fontFamily="monospace">
                {nftInfo.metadata
                  ? JSON.stringify(nftInfo.metadata, null, 2)
                  : intl.formatMessage(messages.missingMetadata)}
              </Typography>
            </TabPanel>
          </TabContext>
        </Grid>
      </Grid>
      <Modal
        onClose={onClose}
        open={open}
        sx={{ background: 'rgba(18, 31, 77, 0.7)', zIndex: '10000', backdropFilter: 'blur(10px)' }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            cursor: 'zoom-out',
          }}
          onClick={onClose}
        >
          <img
            style={{ objectFit: 'cover', maxWidth: '100%', maxHeight: '100%' }}
            src={urlResolveForIpfsAndCorsproxy(nftImage)}
            alt={nftInfo.name}
            title={nftInfo.name}
            loading="lazy"
          />
        </Box>
      </Modal>
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
      <Typography component="div" color="var(--yoroi-palette-gray-600)">
        {label}
      </Typography>
      <Typography component="div" color="var(--yoroi-palette-gray-900)">
        {value}
      </Typography>
    </Box>
  );
}
