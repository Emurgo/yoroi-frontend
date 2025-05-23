import React, { ReactNode, useState } from 'react';
import { Box, styled, Typography, useMediaQuery, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { observer } from 'mobx-react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  title: string;
  tabs: TabItem[];
  containerHeight?: string;
  containerWidth?: {
    large: string;
    small: string;
  };
}

const StyledTab = styled(Tab)({
  '&.MuiTab-root': {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: '11px',
    paddingBottom: '11px',
    marginRight: '24px',
    minWidth: 0,
  },
  '&.MuiTab-root:hover': {
    color: 'ds.primary_blue',
  },
});

export const Tabs = observer(
  ({ title, tabs, containerHeight = 'calc(100vh - 306px)', containerWidth = { large: '640px', small: '480px' } }: TabsProps) => {
    const [value, setValue] = useState(tabs[0]?.id || '0');
    const match = useMediaQuery('(min-width:1441px)');

    const filteredTabs = tabs.filter(tab => tab.content !== null);

    const handleChange = (_: React.SyntheticEvent, newValue: string) => setValue(newValue);

    return (
      <Box sx={{ bgcolor: 'ds.bg_color_high_contrast' }}>
        <Typography component="div" color="ds.gray_700" variant="h4" align="center" my="32px">
          {title}
        </Typography>
        <TabContext value={value}>
          <Box
            sx={{
              bgcolor: 'ds.bg_color_high_contrast',
              marginLeft: '32px',
              marginRight: '32px',
            }}
          >
            <TabList
              sx={{
                width: match ? containerWidth.large : containerWidth.small,
                boxShadow: 'none',
                '&.MuiTabs-indicator': { height: '2px' },
              }}
              textColor="primary"
              indicatorColor="primary"
              onChange={handleChange}
              aria-label="Tabs"
            >
              {filteredTabs.map(({ label, id }) => (
                <StyledTab
                  key={id}
                  disableRipple
                  label={
                    <Typography component="div" variant="body1" fontWeight={500}>
                      {label}
                    </Typography>
                  }
                  value={id}
                />
              ))}
            </TabList>
            <Box sx={{ bgcolor: 'ds.gray_100', height: '1px', width: '100%' }} />
          </Box>
          {filteredTabs.map(({ content, id }) => (
            <TabPanel
              sx={{
                height: containerHeight,
                overflowY: 'scroll',
                margin: 'auto',
                boxShadow: 'none',
                bgcolor: 'ds.bg_color_high_contrast',
                p: '32px',
                pr: '12px',
                width: match ? containerWidth.large : containerWidth.small,
              }}
              value={id}
              key={id}
            >
              {content}
            </TabPanel>
          ))}
        </TabContext>
      </Box>
    );
  }
);
