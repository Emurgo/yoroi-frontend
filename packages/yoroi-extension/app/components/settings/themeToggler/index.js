//@flow

import { Box, FormControlLabel, Radio, RadioGroup, useTheme } from '@mui/material';
import type { Node } from 'react';
import { useThemeMode } from '../../../styles/context/mode';
import LocalStorageApi from '../../../api/localStorage';

const ThemeToggler = (): Node => {
  const { toggleColorMode } = useThemeMode();
  const localStorageApi = new LocalStorageApi();
  const { name } = useTheme();

  return (
    <Box>
      <Box>
        <RadioGroup
          aria-labelledby="theme-switch-buttons"
          value={name === 'light-theme' ? 'light' : 'dark'}
          onChange={async e => {
            toggleColorMode(e.target.value);
            await localStorageApi.setUserThemeMode(e.target.value);
          }}
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <FormControlLabel
            value={'light'}
            control={
              <Radio
                sx={{
                  color: 'primary.500',
                }}
                size="small"
              />
            }
            label={'Light Theme'}
            id="switchToNewVersionButton"
          />
          <FormControlLabel
            value={'dark'}
            control={<Radio sx={{ color: 'primary.500' }} size="small" />}
            label={'Dark Theme'}
            id="switchToOldVersionButton"
            sx={{
              marginRight: '20px',
            }}
          />
        </RadioGroup>
      </Box>
    </Box>
  );
};

export default ThemeToggler;
