//@flow

import { Box, FormControlLabel, Radio, RadioGroup, useTheme, styled } from '@mui/material';
import type { Node } from 'react';
import { useThemeMode } from '../../../styles/context/mode';
import LocalStorageApi from '../../../api/localStorage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  lightTheme: {
    id: 'settings.general.theme.light',
    defaultMessage: '!!!Light Theme',
  },
  darkTheme: {
    id: 'settings.general.theme.dark',
    defaultMessage: '!!!Dark Theme',
  },
});

const SRadio = styled(Radio)(({ theme }: any) => ({
  color: theme.palette.ds.el_primary_medium,
  '&.Mui-checked': {
    color: theme.palette.ds.el_primary_medium,
  },
}));

const ThemeToggler = ({ intl }: {| intl: $npm$ReactIntl$IntlFormat |}): Node => {
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
            control={<SRadio size="small" />}
            label={intl.formatMessage(messages.lightTheme)}
            id="switchToNewVersionButton"
          />
          <FormControlLabel
            value={'dark'}
            control={<SRadio size="small" />}
            label={intl.formatMessage(messages.darkTheme)}
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
