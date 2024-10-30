import { Box, Divider } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { Card } from '../../../../../components';
import Menu from '../../../common/components/Menu';
import { useStrings } from '../../../common/hooks/useStrings';
import { SubMenuOption } from '../../../common/types/index';
import TokenDetailOverview from './Overview';
import TokenDetailPerformance from './Performance';

const TabContent = styled(Box)({
  flex: 1,
});

interface Props {
  tokenInfo: TokenInfoType;
}

const OverviewPerformance = ({ tokenInfo }: Props): JSX.Element => {
  const theme: any = useTheme();
  const strings = useStrings();

  const subMenuOptions: SubMenuOption[] = [
    {
      label: strings.overview,
      className: 'overview',
      route: 'overview',
    },
    // {
    //   label: strings.performance,
    //   className: 'performance',
    //   route: 'performance',
    // },
  ];

  const [selectedTab, setSelectedTab] = useState(subMenuOptions[0]?.route);

  const isActiveItem = (route: string) => {
    if (route === selectedTab) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Card sx={{ backgroundColor: 'ds.gray_min' }}>
      <Box sx={{ marginTop: `${theme.spacing(2)}`, backgroundColor: 'ds.bg_color_max', marginX: theme.spacing(3) }}>
        <Menu options={subMenuOptions} onItemClick={(route: string) => setSelectedTab(route)} isActiveItem={isActiveItem} />
        <Divider />
      </Box>
      <Box sx={{ px: theme.spacing(3), pt: theme.spacing(3), pb: theme.spacing(2) }}>
        {selectedTab === subMenuOptions[0]?.route ? (
          <TabContent>
            <TokenDetailOverview tokenInfo={tokenInfo} />
          </TabContent>
        ) : null}

        {selectedTab === subMenuOptions[1]?.route ? (
          <TabContent>
            <TokenDetailPerformance tokenInfo={tokenInfo} />
          </TabContent>
        ) : null}
      </Box>
    </Card>
  );
};

export default OverviewPerformance;
