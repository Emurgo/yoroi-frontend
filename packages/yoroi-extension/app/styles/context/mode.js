// @flow
import type { Node } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { baseLightTheme } from '../themes/light-theme-mui';
import { baseDarkTheme } from '../themes/dark-theme-mui';
import LocalStorageApi from '../../api/localStorage/index';
import React, { useEffect } from 'react';
import { noop } from '../../coreUtils';

export type Modes = 'light' | 'dark';

const ColorModeContext = React.createContext();

function getDesignTokens(mode: string): Object {
  return mode === 'light' ? baseLightTheme : baseDarkTheme;
}

function ColorModeProvider({ children }: any): Node {
  const [mode, setMode] = React.useState<Modes>('light');
  const localStorageApi = new LocalStorageApi();

  useEffect(() => {
    noop(getCurrentThemeFromStorage());
  }, []);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode: Modes) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const getCurrentThemeFromStorage = async () => {
    const currentThemeMode = await localStorageApi.getUserThemeMode();
    if (currentThemeMode) {
      setMode(currentThemeMode === 'dark' ? 'dark' : 'light');
    }
  };

  // Update the theme only if the mode changes
  const theme = React.useMemo(() => {
    return getDesignTokens(mode);
  }, [mode]);

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
