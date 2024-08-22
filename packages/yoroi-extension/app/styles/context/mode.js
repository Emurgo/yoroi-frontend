// @flow
import type { Node } from 'react';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { baseLightTheme } from '../themes/light-theme-mui';
import { baseDarkTheme } from '../themes/dark-theme-mui';
import { MuiThemes, THEMES } from '../themes';
import LocalStorageApi from '../../api/localStorage/index';
import { useEffect } from 'react';

export type Modes = 'light' | 'dark';

const ColorModeContext = React.createContext();

function getDesignTokens(mode: string): Object {
  return mode === 'light' ? baseLightTheme : baseDarkTheme;
}

function ColorModeProvider({ children, currentTheme }: any): Node {
  const [mode, setMode] = React.useState<Modes>('light');
  const localStorageApi = new LocalStorageApi();

  useEffect(() => {
    getCurrentThemeFromStorage();
  }, []);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: mode => {
        setMode((prevMode: Modes) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const getCurrentThemeFromStorage = async () => {
    const currentTheme = await localStorageApi.getUserThemeMode();
    if (currentTheme) {
      setMode(currentTheme === 'light' ? 'light' : 'dark');
    }
  };

  // Update the theme only if the mode changes
  const theme = React.useMemo(() => {
    if (currentTheme === THEMES.YOROI_BASE) return getDesignTokens(mode);
    return MuiThemes[currentTheme];
  }, [mode, currentTheme]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

function useThemeMode(): Object {
  const context = React.useContext(ColorModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within a ColorModeContextProvider');
  }

  return context;
}

export { ColorModeProvider, useThemeMode };
