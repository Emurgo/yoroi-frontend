// @flow
import type { Node } from 'react';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { baseLightTheme } from '../themes/light-theme-mui';
import { baseDarkTheme } from '../themes/dark-theme-mui';
import { MuiThemes, THEMES } from '../themes';

export type Modes = 'light' | 'dark';

const ColorModeContext = React.createContext();

function getDesignTokens(mode: string): Object {
  return mode === 'light' ? baseLightTheme : baseDarkTheme;
}

function ColorModeProvider({ children, currentTheme }: any): Node {
  const [mode, setMode] = React.useState<Modes>('dark');
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
