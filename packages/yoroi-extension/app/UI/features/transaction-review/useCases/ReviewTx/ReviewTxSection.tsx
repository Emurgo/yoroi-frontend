import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import { Box, Divider } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import Menu from '../../../portfolio/common/components/Menu';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { OverviewTab } from './Overview/OverviewTab';

const StyledDrawer = styled(Drawer)(({ theme }: any) => ({
  '& .MuiDrawer-paper': {
    width: '530px',
    backgroundColor: theme.palette.ds.bg_color_max,
  },
}));

const TabContent = styled(Box)({
  flex: 1,
});

export interface SubMenuOption {
  label: string;
  route: string;
}

export const ReviewTxSection = () => {
  const theme = useTheme();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const { height, width, closeTxReviewModal, content, title, isOpen } = useTxReviewModal();

  const toggleDrawer = (anchor: string, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
    closeTxReviewModal();
  };

  const subMenuOptions: SubMenuOption[] = [
    {
      label: 'Overview',
      route: 'overview',
    },
    {
      label: 'UTxOs',
      route: 'UTxOs',
    },
    {
      label: 'Metadata',
      route: 'metadata',
    },
    {
      label: 'Reference inputs',
      route: 'inputs',
    },
  ];
  const [selectedTab, setSelectedTab] = React.useState(subMenuOptions[0]?.route);

  const isActiveItem = (route: string) => {
    if (route === selectedTab) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <StyledDrawer open={isOpen} onClose={toggleDrawer('right', false)} anchor={'right'}>
      <Typography variant="h3" my="24px" fontWeight="500" textAlign="center">
        {title}
      </Typography>

      <Box sx={{ backgroundColor: 'ds.bg_color_max', marginX: theme.spacing(3) }}>
        <Menu options={subMenuOptions} onItemClick={(route: string) => setSelectedTab(route)} isActiveItem={isActiveItem} />
        <Divider />
      </Box>

      {selectedTab === subMenuOptions[0]?.route ? (
        <TabContent>
          <OverviewTab />
        </TabContent>
      ) : null}
    </StyledDrawer>
  );
};
