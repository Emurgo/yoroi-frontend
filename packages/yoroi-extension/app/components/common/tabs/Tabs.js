// @flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';

type TabProps = {|
  label: string,
  isActive: boolean,
  onClick(): void,
  disabled?: boolean,
|};

type Props = {|
  tabs: Array<TabProps>,
|};

export default function Tabs({ tabs = [] }: Props): Node {
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
}

const TabButton = ({ label, isActive, onClick, disabled }: TabProps): Node => (
  <Box
    onClick={disabled ? undefined : onClick}
    p="8px"
    borderRadius="8px"
    bgcolor={isActive ? 'ds.gray_c200' : ''}
    sx={{ cursor: disabled ? 'not-allowed' : 'pointer', color: disabled ? 'ds.gray_c400' : '' }}
  >
    <Typography component="div" variant="body1" fontWeight={500}>
      {label}
    </Typography>
  </Box>
);
