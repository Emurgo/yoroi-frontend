import { Link } from 'react-router';
import { Stack, Button } from '@mui/material';
import { ROUTES } from '../../../../../routes-config';
import { IconWrapper, Icons } from '../../../../components';
import { ampli } from '../../../../../../ampli';
import { TabItem } from '../../../../components/tabs/Tabs';

type NftsNavigationProps = {
  prevNftId: string;
  nextNftId: string;
  activeTab: TabItem;
};

const NftsNavigation = ({ prevNftId, nextNftId, activeTab }: NftsNavigationProps) => {
  const handleNavigationEvent = (direction: 'Previous' | 'Next') => {
    ampli.nftGalleryDetailsNavigation({ nft_navigation: direction });
  };

  return (
    <Stack direction="row" spacing={16}>
      <Link
        to={ROUTES.NFT_GALLERY.DETAILS.replace(':nftId', prevNftId) + `?tab=${activeTab.id}`}
        onClick={() => handleNavigationEvent('Previous')}
      >
        <Button aria-label="Previous" size="small" id="nftDetails-previousNFT-button">
          <IconWrapper icon={Icons.ChevronLeft} />
        </Button>
      </Link>
      <Link
        to={ROUTES.NFT_GALLERY.DETAILS.replace(':nftId', nextNftId) + `?tab=${activeTab.id}`}
        onClick={() => handleNavigationEvent('Next')}
      >
        <Button aria-label="Next" size="small" id="nftDetails-nextNFT-button">
          <IconWrapper icon={Icons.ChevronRight} />
        </Button>
      </Link>
    </Stack>
  );
};

export default NftsNavigation;
