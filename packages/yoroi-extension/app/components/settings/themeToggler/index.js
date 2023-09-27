//@flow

import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { useThemeMode } from '../../../styles/context/mode';
import { ReactComponent as IconSun } from '../../../assets/images/top-bar/sun.inline.svg';
import { ReactComponent as IconMoon } from '../../../assets/images/top-bar/moon.inline.svg';

export default function ThemeToggler(): any {
  const [mode, setMode] = useState(false);
  const { toggleColorMode } = useThemeMode();

  const toggle = () => {
    setMode(md => !md);
    toggleColorMode();
  };

  return (
    <Box>
      <Button startIcon={mode ? <IconSun /> : <IconMoon />} onClick={toggle}>
        {mode ? 'Use Light Theme' : 'Use Dark Theme'}
      </Button>
    </Box>
  );
}
