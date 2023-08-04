// @flow
import React from 'react';
import type { Node } from 'react';
import { MuiThemes, THEMES } from '../utils';
import { ThemeProvider } from '@mui/material/styles';
import { getDesignTokens } from '../themes/revamp-theme';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';

export type Modes = 'light' | 'dark';

const ColorModeContext = React.createContext();

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
      <CssVarsProvider theme={extendTheme({ cssVarPrefix: 'yoroi' })}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </CssVarsProvider>
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
