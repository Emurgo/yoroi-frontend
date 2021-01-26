// @flow
import React from 'react';
import type { Node } from 'react';
import './App.scss';
import { ThemeProvider } from 'react-polymorph/lib/components/ThemeProvider';

import { yoroiPolymorphTheme } from '../../../app/themes/PolymorphThemes';
import { themeOverrides } from '../../../app/themes/overrides';
import { changeToplevelTheme } from '../../../app/themes';
import Layout from './components/layout/Layout';
import Home from './screens/Home';

const App = (): Node => {
  const currentTheme = 'YoroiModern';
  changeToplevelTheme(currentTheme);

  return (
    <ThemeProvider theme={yoroiPolymorphTheme} themeOverrides={themeOverrides(currentTheme)}>
      <Layout>
        <Home />
      </Layout>
    </ThemeProvider>
  );
};

export default App;
