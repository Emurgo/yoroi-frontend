import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import { Box, Divider } from '@mui/material';
import Menu from '../../../portfolio/common/components/Menu';
import { mockReviewTX } from '../../common/mockData';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { OverviewTab } from './Overview/OverviewTab';
import { ReferenceInputsTab } from './ReferenceInputs/ReferenceInputsTab';
import { UTxOsTab } from './UTxOs/UTxOsTab';

const TabContent = styled(Box)({
  flex: 1,
});

export interface SubMenuOption {
  label: string;
  route: string;
}

export const ReviewTxSection = () => {
  const theme = useTheme();

  const { title } = useTxReviewModal();

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
      route: 'referenceInputs',
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
    <Box>
      <Box sx={{ backgroundColor: 'ds.bg_color_max', marginX: theme.spacing(3) }}>
        <Menu options={subMenuOptions} onItemClick={(route: string) => setSelectedTab(route)} isActiveItem={isActiveItem} />
        <Divider />
      </Box>

      {selectedTab === subMenuOptions[0]?.route ? (
        <TabContent>
          <OverviewTab />
        </TabContent>
      ) : null}
      {selectedTab === subMenuOptions[1]?.route ? (
        <TabContent>
          <UTxOsTab />
        </TabContent>
      ) : null}
      {selectedTab === subMenuOptions[2]?.route ? (
        <TabContent>
          <Typography>Metadata here - TODO</Typography>
        </TabContent>
      ) : null}
      {selectedTab === subMenuOptions[3]?.route ? (
        <TabContent>
          <ReferenceInputsTab referenceInputs={mockReviewTX.referenceInputs} />
        </TabContent>
      ) : null}
    </Box>
  );
};
