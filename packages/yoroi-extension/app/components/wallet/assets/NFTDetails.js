// @flow
import { useState } from 'react';
import type { Node, ComponentType } from 'react';
import { Box, styled } from '@mui/system';
import { Link as LinkMui, Typography, Stack, Tab, Modal, ThemeProvider, createTheme, Button, IconButton } from '@mui/material';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import globalMessages from '../../../i18n/global-messages';
import { injectIntl, defineMessages } from 'react-intl';
import { ReactComponent as BackArrow }  from '../../../assets/images/assets-page/backarrow.inline.svg';
import { ReactComponent as IconCopy }  from '../../../assets/images/copy.inline.svg';
import { ReactComponent as IconCopied }  from '../../../assets/images/copied.inline.svg';
import { ReactComponent as Chevron }  from '../../../assets/images/assets-page/chevron-right.inline.svg';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import { getNetworkUrl, tokenMessages } from './TokenDetails';
import type { NetworkRow, CardanoAssetMintMetadata } from '../../../api/ada/lib/storage/database/primitives/tables';
import { NftImage } from './NFTsList';
import { isCardanoHaskell } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { truncateAddress, truncateAddressShort } from '../../../utils/formatters';

// Overwrite current theme
// Temporary solution untill the new design system.
const theme = createTheme({
  palette: {
    primary: {
      main: '#3154CB'
    },
  },
  typography: {
    fontFamily: 'Rubik'
  }
});

type Props = {|
  nftInfo: void | {|
    policyId: string,
    ticker: string,
    assetName: string,
    name: string | void,
    id: string,
    image: string | null,
    description: ?string,
    author: ?string,
    metadata: CardanoAssetMintMetadata | null,
  |},
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
  },
  description: {
    id: 'wallet.nftGallary.details.description',
    defaultMessage: '!!!Description'
  },
  author: {
    id: 'wallet.nftGallary.details.author',
    defaultMessage: '!!!Author'
  }
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

function NFTDetails({
  nftInfo,
  network,
  intl,
  nextNftId,
  prevNftId,
  tab,
}: Props & Intl): Node {

  const networkUrl = getNetworkUrl(network);
  const [activeTab, setActiveTab] = useState(tab !== null ? tab : tabs[0].id); // Overview tab
  const [open, setOpen] = useState(false);
  const [isCopied, setCopy] = useState(false);
  const below1400 = useMediaQuery('(max-width:1400px)');
  const below1250 = useMediaQuery('(max-width:1250px)');

  const onCopyMetadata = async () => {
    if (nftInfo.metadata === null) return;

    setCopy(false)
    try {
      await navigator.clipboard.writeText(JSON.stringify(nftInfo.metadata, null, 2))
      setCopy(true)
    } catch (error) {
      setCopy(false)
    }
  }
  const onClose = () => setOpen(false)
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
    <Box sx={{ overflowX: 'hidden' }}>
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
          <BackArrow />
          <Box component='span' marginLeft='10px'>{intl.formatMessage(messages.back)}</Box>
        </Typography>
      </Box>
      <Stack
        direction="row"
        sx={{
          margin: '0 auto',
          minHeight: '520px',
          marginY: '21px',
          backgroundColor: 'var(--yoroi-palette-common-white)',
          borderRadius: '8px',
          overflowX: 'auto',
        }}
      >
        <ImageItem sx={{ cursor: nftInfo.image !== null ? 'zoom-in' : 'auto', padding: below1400 ? '10px' : '24px' }} onClick={() => nftInfo.image !== null && setOpen(true)}>
          <NftImage imageUrl={nftInfo.image} name={nftInfo.name || '-'} width='532px' height='510px' />
        </ImageItem>
        <Box flex={1} sx={{ paddingTop: below1400 ? '10px' : '24px', paddingBottom: '22px' }}>
          <Stack
            justifyContent='space-between'
            flexDirection='row'
            sx={{
              paddingBottom: '22px',
              px: '24px',
            }}
          >
            <TruncatedText variant="h2" sx={{ width: below1400 ? '200px' : '400px' }} color="var(--yoroi-palette-gray-900)">
              {nftInfo.name}
            </TruncatedText>

            <Stack direction='row' spacing={1}>
              <Link to={ROUTES.NFTS.DETAILS.replace(':nftId', prevNftId) + `?tab=${activeTab}`}>
                <IconButton
                  aria-label='Previous'
                  sx={{ transform: 'rotate(180deg)', width: '32px' }}
                >
                  <Chevron />
                </IconButton>
              </Link>
              <Link to={ROUTES.NFTS.DETAILS.replace(':nftId', nextNftId) + `?tab=${activeTab}`}>
                <IconButton
                  aria-label='Next'
                  sx={{ width: '32px' }}
                >
                  <Chevron />
                </IconButton>
              </Link>
            </Stack>
          </Stack>
          <ThemeProvider theme={theme}>
            <TabContext value={activeTab}>
              <Box>
                <TabList
                  sx={{
                    boxShadow: 'none',
                    borderRadius: '0px',
                    marginX: '24px',
                    borderBottom: 1,
                    borderColor: 'divider'
                  }}
                  onChange={(_, newValue) =>  setActiveTab(newValue)}
                  aria-label="NFTs tabs"
                >
                  {tabs.map(({ label, id }) => (
                    <Tab key={id} sx={{ minWidth: 'unset', paddingX: '0px', width: 'content', marginRight: id === tabs[0].id && '24px', textTransform: 'none', fontWeight: 500 }} label={intl.formatMessage(label)} value={id} />
                  ))}
                </TabList>
              </Box>
              <TabPanel
                sx={{
                  boxShadow: 'none',
                  paddingBottom: '0px',
                  bgcolor: 'transparent',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}
                value={tabs[0].id}
              >
                <Stack spacing='24px'>
                  <LabelWithValue label={intl.formatMessage(messages.description)} value={nftInfo.description || '-'} />
                  <LabelWithValue label={intl.formatMessage(messages.author)} value={nftInfo.author || '-'} />
                  <LabelWithValue
                    label={intl.formatMessage(globalMessages.fingerprint)}
                    value={
                      <CopyAddress text={nftInfo.id}>
                        {displayAddr(nftInfo.id)}
                      </CopyAddress>
                    }
                  />

                  <LabelWithValue
                    label={intl.formatMessage(tokenMessages.policyId)}
                    value={
                      <CopyAddress text={nftInfo.policyId}>
                        {displayAddr(nftInfo.policyId)}
                      </CopyAddress>
                    }
                  />

                  {isCardanoHaskell(network) &&
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
                          networkUrl != null && `${networkUrl}/${nftInfo.policyId}${nftInfo.assetName}`
                        }
                        disabled={networkUrl === null}
                        rel="noopener noreferrer"
                        sx={{ textDecoration: 'none' }}
                      >
                        {intl.formatMessage(globalMessages.cardanoscan)}
                      </LinkMui>
                    }
                  />}
                </Stack>
              </TabPanel>

              <TabPanel
                sx={{ boxShadow: 'none', bgcolor: 'transparent', height: '100%', maxHeight: '400px', overflow: 'auto' }}
                value={tabs[1].id}
              >
                {nftInfo.metadata &&
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
                    {nftInfo.metadata ?
                      JSON.stringify(nftInfo.metadata, null, 2):
                      intl.formatMessage(messages.missingMetadata)}
                  </Typography>
                </Box>
              </TabPanel>
            </TabContext>
          </ThemeProvider>
        </Box>
      </Stack>
      <Modal onClose={onClose} open={open} sx={{ background: 'rgba(18, 31, 77, 0.7)', zIndex: '10000', backdropFilter: 'blur(10px)' }}>
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
          <img style={{ objectFit: 'cover', maxWidth: '100%', maxHeight: '100%' }} src={nftInfo.image?.replace('ipfs://', 'https://ipfs.io/ipfs/')} alt={nftInfo.name} title={nftInfo.name} loading='lazy' />
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

// Requrie predefined with
// jone -> jo..
const TruncatedText = styled(Typography)({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

function CopyAddress({ text, children }): Node {
  const [isCopied, setCopy] = useState(false);

  const onCopy = async () => {
    setCopy(false)

    try {
      await navigator.clipboard.writeText(text)
      setCopy(true)
    } catch (error) {
      setCopy(false)
    }

    setTimeout(() => {
      setCopy(false)
    }, 2500) // 2.5 sec
  }

  return (
    <Stack direction='row' alignItems='center' justifyContent='space-between'>
      <TruncatedText sx={{ width: '90%' }}>
        {children}
      </TruncatedText>

      <IconButton onClick={onCopy}>
        {isCopied ? <IconCopied /> : <IconCopy />}
      </IconButton>
    </Stack>
  )
}

function LabelWithValue({ label, value }: {| label: string | Node, value: string | Node |}): Node {
  return (
    <Box>
      <Typography color="var(--yoroi-palette-gray-600)">{label}</Typography>
      <Typography color="var(--yoroi-palette-gray-900)">{value}</Typography>
    </Box>
  );
}
