// @flow
import type { Node } from 'react';
import type { StoresMap } from './stores';
import { Component, useEffect } from 'react';
import { observer } from 'mobx-react';
import { HashRouter, useLocation, useNavigate } from 'react-router';
import { observable, autorun, runInAction } from 'mobx';
import { YoroiRoutes } from './Routes';
import { translations } from './i18n/translations';
import { Logger } from './utils/logging';
import { ColorModeProvider } from './styles/context/mode';
import { CssBaseline } from '@mui/material';
import { globalStyles } from './styles/globalStyles';
import { changeToplevelTheme, MuiThemes } from './styles/themes';
import ThemeManager from './ThemeManager';
import environment from './environment';
import MaintenancePage from './containers/MaintenancePage';
import CrashPage from './containers/CrashPage';
// $FlowIgnore: suppressing this error
import { SupportChatbox } from './UI/components/widgets/CrispChatbox/SupportChatbox';
// $FlowIgnore: suppressing this error
import NotificationsProvider from './UI/features/notifications/module/NotificationsProvider';
// $FlowIgnore: suppressing this error
import NotificationsManager from './UI/features/notifications/common/NotificationsManager';
import { ROUTES } from './routes-config';
import 'react-tooltip/dist/react-tooltip.css';
import { IntlProvider } from 'react-intl';
import { filterByValues } from './coreUtils';
// $FlowFixMe[cannot-resolve-module]
import { captureEvent } from '../posthog';

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

    if (pathname === ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES) {
      captureEvent('Connector Page Viewed');
    } else if (pathname === ROUTES.WALLETS.ADD) {
      captureEvent('Create Wallet Select Method Page Viewed');
    } else if (pathname === ROUTES.WALLETS.RECEIVE.ROOT) {
      captureEvent('Receive Page Viewed');
    } else if (pathname === ROUTES.SETTINGS.ROOT) {
      captureEvent('Settings Page Viewed');
    } else if (pathname === ROUTES.REVAMP.CATALYST_VOTING) {
      captureEvent('Voting Page Viewed');
    } else if (pathname === ROUTES.STAKING) {
      captureEvent('Staking Center Page Viewed');
    } else if (pathname === ROUTES.WALLETS.ROOT) {
      captureEvent('Transactions Page Viewed');
    } else if (pathname === ROUTES.Governance.ROOT) {
      captureEvent('Governance Dashboard Page Viewed');
    } else if (pathname === ROUTES.PORTFOLIO.ROOT) {
      captureEvent('Portfolio Dashboard Page Viewed');
    } else if (pathname === ROUTES.PROFILE.URI_PROMPT) {
      captureEvent('Payment Urls Page Viewed');
    } else if (pathname === ROUTES.CASHBACK.ROOT) {
      captureEvent('Cashback Dashboard Viewed');
    } else if (pathname === ROUTES.AIRDROP) {
      captureEvent('Midnight Airdrop Page Viewed');
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

      const englishMessages = await translations['en-US'];
      const localeMessages = await translations[locale];

      // clean wrong format strings from locale messages
      // to be removed after all locale messages get updated
      const fixedLocaleMessages = filterByValues(
        localeMessages,
        v => !v.includes('<span') && !v.includes('<br>') && !v.includes('<a target=')
      );

      runInAction(() => {
        this.mergedMessages = { ...englishMessages, ...fixedLocaleMessages };
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
    const { stores } = this.props;

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

    const locale = stores.profile.currentLocale;
    const mergedMessages = this.mergedMessages;
    if (mergedMessages === null) {
      return null;
    }

    return (
      <div style={{ height: '100%' }}>
        <ColorModeProvider>
          <CssBaseline />
          {globalStyles(muiTheme)}
          <ThemeManager cssVariables={themeVars} />
          <HashRouter>
            <IntlProvider locale={locale} key={locale} messages={mergedMessages}>
              {this.getContent()}
            </IntlProvider>
          </HashRouter>
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
      <NotificationsProvider
        walletsStore={stores.wallets}
        appLoadedSlots={window.yoroi.appLoadedSlotPerNetwork}
        pushNotificationStore={stores.pushNotificationStore}
        tokenInfoStore={stores.tokenInfoStore}
      >
        <NotificationsManager />
        <div style={{ height: '100%' }}>
          <SupportChatbox />
          {YoroiRoutes(stores)}
          <RoutingHelper stores={stores} />
        </div>
      </NotificationsProvider>
    );
  };
}

export default App;
