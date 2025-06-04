// @flow
import type { Node } from 'react';
import type { RouterHistory } from 'react-router-dom';
import type { StoresMap } from './stores';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { Router } from 'react-router-dom';
import { addLocaleData } from 'react-intl';
import { observable, autorun, runInAction } from 'mobx';
import { Routes } from './Routes';
import { locales, translations } from './i18n/translations';
import { Logger } from './utils/logging';
import { ColorModeProvider } from './styles/context/mode';
import { CssBaseline } from '@mui/material';
import { globalStyles } from './styles/globalStyles';
import { changeToplevelTheme, MuiThemes } from './styles/themes';
import ThemeManager from './ThemeManager';
import environment from './environment';
import MaintenancePage from './containers/MaintenancePage';
import CrashPage from './containers/CrashPage';
import Support from './components/widgets/Support';
// $FlowIgnore: suppressing this error
import NotificationsProvider from './UI/features/notifications/module/NotificationsProvider';
// $FlowIgnore: suppressing this error
import NotificationsManager from './UI/features/notifications/common/NotificationsManager';
// $FlowIgnore: suppressing this error
import { IntlContextProvider, IntlProviderWrapper } from './UI/common/context/IntlContextProvider';

import 'react-tooltip/dist/react-tooltip.css';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData(locales);

type Props = {|
  +stores: StoresMap,
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
      const locale = this.props.stores.profile.currentLocale;
      const _mergedMessages = {
        ...(await translations['en-US']),
        ...(await translations[locale]),
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

  render(): Node {
    const mergedMessages = this.mergedMessages;
    if (mergedMessages === null) {
      return null;
    }

    const { stores } = this.props;
    const locale = stores.profile.currentLocale;

    Logger.debug(`[yoroi] messages merged`);

    const themeVars = {
      // show wingdings on dev builds when no font is set to easily find
      // missing font bugs. However, on production, we use Times New Roman
      // which looks ugly but at least it's readable.
      '--default-font': !environment.isProduction() ? 'wingdings' : 'Times New Roman',
    };

    const currentTheme = stores.profile.currentTheme;
    changeToplevelTheme(currentTheme);
    const muiTheme = MuiThemes[currentTheme];
    Logger.debug(`[yoroi] themes changed`);

    return (
      <div style={{ height: '100%' }}>
        <ColorModeProvider>
          <CssBaseline />
          {globalStyles(muiTheme)}
          <ThemeManager cssVariables={themeVars} />
          {/* Automatically pass a theme prop to all components in this subtree. */}
          <IntlProviderWrapper locale={locale} messages={mergedMessages}>
            {this.getContent()}
          </IntlProviderWrapper>
        </ColorModeProvider>
      </div>
    );
  }

  getContent: void => ?Node = () => {
    const { stores, history } = this.props;
    if (this.state.crashed === true) {
      return <CrashPage />;
    }
    if (stores.serverConnectionStore.isMaintenance) {
      return <MaintenancePage stores={stores} />;
    }
    return (
      <Router history={history}>
        <IntlContextProvider>
          <NotificationsProvider
            walletsStore={stores.wallets}
            appLoadedSlots={window.yoroi.appLoadedSlotPerNetwork}
          >
            <NotificationsManager />
            <div style={{ height: '100%' }}>
              <Support />
              {Routes(stores)}
            </div>
          </NotificationsProvider>
        </IntlContextProvider>
      </Router>
    );
  };
}

export default App;
