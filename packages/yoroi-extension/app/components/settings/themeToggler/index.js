//@flow

import { Box, FormControlLabel, Radio, RadioGroup, Typography, useTheme, styled } from '@mui/material';
import type { Node } from 'react';
import { useThemeMode } from '../../../styles/context/mode';
import LocalStorageApi from '../../../api/localStorage';
import { useIntl, defineMessages } from 'react-intl';
import { ampli } from '../../../../ampli/index';

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

const ThemeToggler = (): Node => {
  const intl = useIntl();
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
            const theme = e.target.value;
            toggleColorMode(theme);
            await localStorageApi.setUserThemeMode(theme);
            ampli.themeSelected({ theme });
          }}
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <FormControlLabel
            value={'light'}
            control={<SRadio size="small" />}
            label={
              <Typography component="span" variant="body1" color="ds.text_gray_medium">
                {intl.formatMessage(messages.lightTheme)}
              </Typography>
            }
            id="switchToNewVersionButton"
            input
          />
          <FormControlLabel
            value={'dark'}
            control={<SRadio size="small" />}
            label={
              <Typography component="span" variant="body1" color="ds.text_gray_medium">
                {intl.formatMessage(messages.darkTheme)}
              </Typography>
            }
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
