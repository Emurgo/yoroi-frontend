// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { HashRouter as Router } from 'react-router';
import { IntlProvider } from 'react-intl';
import { autorun, observable, runInAction } from 'mobx';
import { YoroiRoutes } from './Routes';
import { translations } from '../i18n/translations';
import type { StoresMap } from './stores';
import ThemeManager from '../ThemeManager';
import CrashPage from '../containers/CrashPage';
import { Logger } from '../utils/logging';
import { ThemeProvider } from '@mui/material/styles';
import { globalStyles } from '../styles/globalStyles';
import { CssBaseline } from '@mui/material';
import { changeToplevelTheme, MuiThemes } from '../styles/themes';

type Props = {|
  +stores: StoresMap,
|};
type State = {|
  crashed: boolean,
|};

@observer
class App extends Component<Props, State> {
  @observable mergedMessages: null | {| [key: string]: string |} = null;

  componentDidMount: () => void = () => {
    autorun(async () => {
      const _mergedMessages = {
        ...(await translations['en-US']),
        ...(await translations[this.props.stores.profile.currentLocale]),
      };
      runInAction(() => {
        this.mergedMessages = _mergedMessages;
      });
    });
  };

  state: State = {
    crashed: false,
  };

  static getDerivedStateFromError(_error: any): State {
    // Update state so the next render will show the fallback UI.
    return { crashed: true };
  }

  componentDidCatch(error: any, errorInfo: any): void {
    Logger.error(errorInfo.componentStack);
  }

  componentWillUnmount() {
    window.removeEventListener('unload', () => {});
  }

  render(): Node {
    const mergedMessages = this.mergedMessages;
    if (mergedMessages === null) {
      return null;
    }

    const { stores } = this.props;
    const locale = stores.profile.currentLocale;

    const currentTheme = stores.profile.currentTheme;
    const muiTheme = MuiThemes[currentTheme];
    changeToplevelTheme(currentTheme);

    return (
      <div style={{ height: '100%', backgroundColor: 'var(--yoroi-palette-gray-50)' }}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          {globalStyles(muiTheme)}
          <ThemeManager />
          <IntlProvider {...{ locale, key: locale, messages: mergedMessages }}>
            {this.getContent()}
          </IntlProvider>
        </ThemeProvider>
      </div>
    );
  }

  getContent: void => ?Node = () => {
    const { stores } = this.props;
    if (this.state.crashed === true) {
      return <CrashPage />;
    }
    return (
      <Router>
        <YoroiRoutes stores={stores} />
      </Router>
    );
  };
}

export default App;
