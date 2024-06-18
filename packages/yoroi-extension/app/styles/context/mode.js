// @flow
import type { Node } from 'react';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { revampBaseTheme as revampBaseThemeLight } from '../themes/revamp/light-theme-mui';
import { revampBaseTheme as revampBaseThemeDark } from '../themes/revamp/dark-theme-mui';
import { MuiThemes, THEMES } from '../themes';

export type Modes = 'light' | 'dark';

const ColorModeContext = React.createContext();

function getDesignTokens(mode: string): Object {
  return mode === 'light' ? revampBaseThemeLight : revampBaseThemeDark;
}

function ColorModeProvider({ children, currentTheme }: any): Node {
  const [mode, setMode] = React.useState<Modes>('light');
  const colorMode = React.useMemo(
    () => ({
      // The dark mode switch would invoke this method
      toggleColorMode: () => {
        setMode((prevMode: Modes) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  // Update the theme only if the mode changes
  const theme = React.useMemo(() => {
    if (currentTheme === THEMES.YOROI_REVAMP) return getDesignTokens(mode);
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
