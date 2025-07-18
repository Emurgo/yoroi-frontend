import { useCallback, useState } from 'react';
import { Nft } from '../common/types';
import { TabItem, Tabs } from '../../../components/tabs/Tabs';
import { Box, Button, Grid, Modal, Stack, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router';
import { ampli } from '../../../../../ampli';
import { ROUTES } from '../../../../routes-config';
import { IconWrapper, Icons } from '../../../components';
import { useStrings } from '../common/hooks/useStrings';
import { useNfts } from '../common/hooks/useNfts';
import NftImage from '../common/components/NftImage';
import NftsNavigation from '../common/components/NftsNavigation';
import NftMetadata from '../common/components/NftMetadata';
import NftDetailsOverview from '../common/components/NftDetailsOverview';
import { useNavigateTo } from '../common/hooks/useNavigateTo';

const nftPathId = 'nftDetails';

const ImageItem = ({ nftInfo, onClick }: { nftInfo: Nft | null; onClick: () => void }) => {
  if (!nftInfo) return null;
  return (
    <Box onClick={onClick} sx={{ cursor: 'zoom-in', overflow: 'hidden', height: 'auto' }}>
      <NftImage
        imageSx={{ borderRadius: '8px' }}
        imageUrl={nftInfo.image}
        name={nftInfo.name || '-'}
        width="100%"
        height="100%"
        contentHeight="550px"
        nftPathId={nftPathId}
      />
    </Box>
  );
};

export default function NftDetails() {
  const { nftsList, currentNft, currentNftIndex, networkUrl } = useNfts();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const strings = useStrings();
  const tabSearchParam = new URLSearchParams(location.search).get('tab') || 'overview';
  const [currentTab, setCurrentTab] = useState<TabItem>({ id: tabSearchParam, label: 'Overview' });
  const navigateTo = useNavigateTo();

  const onClose = () => setOpen(false);

  const openModal = () => {
    setOpen(true);
    ampli.nftGalleryDetailsImageViewed();
  };

  const handleTabChange = (tab: TabItem | undefined) => {
    if (!tab) return;
    setCurrentTab(tab);
    ampli.nftGalleryDetailsTab({ nft_tab: tab.id === 'overview' ? 'Overview' : 'Metadata' });
  };

  const getTabs = useCallback(() => {
    return [
      {
        id: 'overview',
        label: 'Overview',
        content: <NftDetailsOverview nftInfo={currentNft} networkUrl={networkUrl} />,
      },
      {
        id: 'metadata',
        label: 'Metadata',
        content: <NftMetadata nftInfo={currentNft} />,
      },
    ];
  }, [currentNft, networkUrl]);

  if (currentNftIndex === -1) {
    navigateTo.nftGallery();
  }

  return (
    <>
      <Box sx={{ mb: '24px', width: '100%' }}>
        <Link to={ROUTES.NFT_GALLERY.ROOT}>
          <Button
            variant="text"
            sx={{ px: '16px !important' }}
            startIcon={<IconWrapper icon={Icons.ChevronLeft} id={`${nftPathId}-backToGallery-button`} />}
          >
            <Typography color="ds.el_gray_medium" fontWeight="500" fontSize="14px">
              {strings.back}
            </Typography>
          </Button>
        </Link>
      </Box>
      <Grid container columns={10}>
        <Grid item xs={4}>
          <ImageItem onClick={openModal} nftInfo={currentNft} />
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" mx="24px" justifyContent="space-between" spacing={16}>
            <Typography variant="h2" id={`${nftPathId}-nftName-text`}>
              {currentNft?.name}
            </Typography>
            {nftsList.length > 1 ? (
              <NftsNavigation
                prevNftId={nftsList[currentNftIndex === 0 ? nftsList.length - 1 : currentNftIndex - 1]?.id || ''}
                nextNftId={nftsList[currentNftIndex === nftsList.length - 1 ? 0 : currentNftIndex + 1]?.id || ''}
                activeTab={currentTab}
              />
            ) : null}
          </Stack>
          <Tabs
            initialTabId={tabSearchParam}
            onTabChange={handleTabChange}
            headerSx={{ mx: '24px' }}
            tabs={getTabs()}
            pathId={nftPathId}
            contentSx={{ mx: '24px', mt: '16px' }}
          />
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
          <NftImage
            imageUrl={currentNft?.image}
            name={currentNft?.name || '-'}
            imageSx={{ maxWidth: '100%', maxHeight: '100%' }}
            nftPathId={nftPathId + ':zoomedImage'}
          />
        </Box>
      </Modal>
    </>
  );
}
