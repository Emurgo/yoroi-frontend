// @flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';

type TabProps = {|
  label: string,
  isActive: boolean,
  onClick(): void,
|};

type Props = {|
  tabs: Array<TabProps>,
|};

export default function Tabs({ tabs = [] }: Props): Node {
  return (
    <Box
      sx={{
        cursor: 'pointer',
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

const TabButton = ({ label, isActive, onClick }: TabProps): Node => (
  <Box onClick={onClick} p="8px" borderRadius="8px" bgcolor={isActive ? 'grayscale.200' : ''}>
    <Typography component="div" variant="body1" fontWeight={500}>
      {label}
    </Typography>
  </Box>
);
