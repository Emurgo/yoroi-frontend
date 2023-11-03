// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Router } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { observable, autorun, runInAction } from 'mobx';
import { Routes } from './Routes';
import { translations } from '../i18n/translations';
import type { StoresMap } from './stores';
import type { ActionsMap } from './actions';
import { changeToplevelTheme, MuiThemes } from '../styles/utils';
import ThemeManager from '../ThemeManager';
import CrashPage from '../containers/CrashPage';
import { Logger } from '../utils/logging';
import type { RouterHistory } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { globalStyles } from '../styles/globalStyles';
import { CssBaseline } from '@mui/material';
import { LayoutProvider } from '../styles/context/layout';

type Props = {|
  +stores: StoresMap,
  +actions: ActionsMap,
  +history: RouterHistory,
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

    const themeVars = Object.assign(stores.profile.currentThemeVars, {});
    const currentTheme = stores.profile.currentTheme;
    const muiTheme = MuiThemes[currentTheme];

    changeToplevelTheme(currentTheme);

    return (
      <div style={{ height: '100%', backgroundColor: 'var(--yoroi-palette-gray-50)' }}>
        <LayoutProvider layout={currentTheme}>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            {globalStyles(muiTheme)}
            <ThemeManager cssVariables={themeVars} />
            <IntlProvider {...{ locale, key: locale, messages: mergedMessages }}>
              {this.getContent()}
            </IntlProvider>
          </ThemeProvider>
        </LayoutProvider>
      </div>
    );
  }

  getContent: void => ?Node = () => {
    const { stores, actions, history } = this.props;
    if (this.state.crashed === true) {
      return <CrashPage />;
    }
    return <Router history={history}>{Routes(stores, actions)}</Router>;
  };
}

export default App;
