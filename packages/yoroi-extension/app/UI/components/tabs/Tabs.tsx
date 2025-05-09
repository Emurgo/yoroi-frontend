import React from 'react';
import { Box, Typography } from '@mui/material';

type TabProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
};

type TabsProps = {
  tabs: TabProps[];
};

const TabButton: React.FC<TabProps> = ({ label, isActive, onClick, disabled }) => (
  <Box
    onClick={disabled ? undefined : onClick}
    p="8px"
    borderRadius="8px"
    bgcolor={isActive ? 'ds.gray_200' : ''}
    sx={{
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: disabled ? 'ds.gray_400' : '',
    }}
  >
    <Typography component="div" variant="body1" fontWeight={500} color="ds.text_gray_medium">
      {label}
    </Typography>
  </Box>
);

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {tabs.map((tab, index) => (
        <TabButton key={index} {...tab} />
      ))}
    </Box>
  );
};

export default Tabs;
