// @flow
import type { Node } from 'react';
import type { StoresMap } from './stores';
import { Component, useEffect } from 'react';
import { observer } from 'mobx-react';
import { HashRouter, useLocation, useNavigate } from 'react-router';
import { addLocaleData } from 'react-intl';
import { observable, autorun, runInAction } from 'mobx';
import { YoroiRoutes } from './Routes';
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
import { IntlContextProvider, IntlProviderWrapper } from './UI/common/context/IntlContextProvider';
import { ampli } from '../ampli/index';
import { ROUTES } from './routes-config';
import { pathToRegexp } from 'path-to-regexp';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData(locales);

type Props = {|
  +stores: StoresMap,
|};
type State = {|
  crashed: boolean,
|};

function RoutingHelper(props: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  if (!props.stores.routing.navigate) {
    props.stores.routing.navigate = navigate;
  }

  useEffect(() => {
    const { pathname } = location;

    runInAction(() => {
      props.stores.routing.currentRoute = pathname;
    });

    if (pathname === ROUTES.ASSETS.ROOT) {
      ampli.assetsPageViewed();
    } else if (pathname === ROUTES.TRANSFER) {
      ampli.claimAdaPageViewed();
    } else if (pathname === ROUTES.PROFILE.LANGUAGE_SELECTION) {
      ampli.createWalletLanguagePageViewed();
    } else if (pathname === ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES) {
      ampli.connectorPageViewed();
    } else if (pathname === ROUTES.WALLETS.ADD) {
      ampli.createWalletSelectMethodPageViewed();
    } else if (pathname === ROUTES.WALLETS.RECEIVE.ROOT) {
      ampli.receivePageViewed();
    } else if (pathname === ROUTES.SETTINGS.ROOT) {
      ampli.settingsPageViewed();
    } else if (pathname === ROUTES.REVAMP.CATALYST_VOTING) {
      ampli.votingPageViewed();
    } else if (pathname === ROUTES.WALLETS.TRANSACTIONS) {
      ampli.transactionsPageViewed();
    } else if (pathname === ROUTES.STAKING) {
      ampli.stakingCenterPageViewed();
    } else if (pathname === ROUTES.WALLETS.ROOT) {
      ampli.walletPageViewed();
    } else if (pathname === ROUTES.Governance.ROOT) {
      ampli.governanceDashboardPageViewed();
    } else if (pathname === ROUTES.PORTFOLIO.ROOT) {
      const TAB = 'Wallet Token';
      ampli.portfolioTokensListPageViewed({ tokens_tab: TAB });
    } else if (pathToRegexp(ROUTES.PORTFOLIO.DETAILS).test(pathname)) {
      const TAB = 'Overview';
      ampli.portfolioTokenDetails({ token_details_tab: TAB });
    }
  }, [location]);

  return null;
}

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
    const { stores } = this.props;
    if (this.state.crashed === true) {
      return <CrashPage />;
    }
    if (stores.serverConnectionStore.isMaintenance) {
      return <MaintenancePage stores={stores} />;
    }
    return (
      <HashRouter>
        <IntlContextProvider>
          <NotificationsProvider
            walletsStore={stores.wallets}
            appLoadedSlots={window.yoroi.appLoadedSlotPerNetwork}
          >
            <NotificationsManager />
            <div style={{ height: '100%' }}>
              <Support />
              {YoroiRoutes(stores)}
              <RoutingHelper stores={stores}/>
            </div>
          </NotificationsProvider>
        </IntlContextProvider>
      </HashRouter>
    );
  };
}

export default App;
