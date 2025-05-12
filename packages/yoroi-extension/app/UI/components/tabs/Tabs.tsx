import React, { ReactNode, useState } from 'react';
import { Box, styled, Typography, Tab, SxProps } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { observer } from 'mobx-react';

export interface TabItem {
  id: string;
  label: string;
  content?: ReactNode;
}

interface TabsProps {
  title?: string;
  tabs: TabItem[];
  initialTabId?: string;
  onTabChange?: (activeTab: TabItem | undefined) => void;
  headerSx?: SxProps;
  contentSx?: SxProps;
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

export const Tabs = observer(({ title, tabs, initialTabId, onTabChange, headerSx = {}, contentSx = {} }: TabsProps) => {
  const [value, setValue] = useState(initialTabId || tabs[0]?.id || '0');
  const filteredTabs = tabs.filter(tab => tab.content !== null);

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    onTabChange?.(tabs.find(tab => tab.id === newValue));
  };

  return (
    <Box sx={{ bgcolor: 'ds.bg_color_high_contrast' }}>
      {title && (
        <Typography component="div" color="ds.gray_700" variant="h4" align="center" my="32px">
          {title}
        </Typography>
      )}
      <TabContext value={value}>
        <Box
          sx={{
            bgcolor: 'ds.bg_color_high_contrast',
            ...headerSx,
          }}
        >
          <TabList
            sx={{
              width: '100%',
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
              width: '100%',
              height: '100%',
              overflowY: 'scroll',
              margin: 'auto',
              boxShadow: 'none',
              bgcolor: 'ds.bg_color_high_contrast',
              ...contentSx,
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
});
