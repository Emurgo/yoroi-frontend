// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Router } from 'react-router-dom';
import type { RouterHistory } from 'react-router-dom';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ko from 'react-intl/locale-data/ko';
import ja from 'react-intl/locale-data/ja';
import zh from 'react-intl/locale-data/zh';
import ru from 'react-intl/locale-data/ru';
import de from 'react-intl/locale-data/de';
import fr from 'react-intl/locale-data/fr';
import nl from 'react-intl/locale-data/nl';
import pt from 'react-intl/locale-data/pt';
import id from 'react-intl/locale-data/id';
import es from 'react-intl/locale-data/es';
import it from 'react-intl/locale-data/it';
import tr from 'react-intl/locale-data/tr';
import cs from 'react-intl/locale-data/cs';
import sk from 'react-intl/locale-data/sk';
import { observable, autorun, runInAction } from 'mobx';
import { Routes } from './Routes';
import { translations } from './i18n/translations';
import type { StoresMap } from './stores';
import type { ActionsMap } from './actions';
import { changeToplevelTheme, MuiThemes } from './styles/utils';
import ThemeManager from './ThemeManager';
import environment from './environment';
import MaintenancePage from './containers/MaintenancePage';
import CrashPage from './containers/CrashPage';
import { Logger } from './utils/logging';
import { LayoutProvider } from './styles/context/layout';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { globalStyles } from './styles/globalStyles';
import Support from './components/widgets/Support';
import { trackNavigation } from './api/analytics';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([
  ...en,
  ...ko,
  ...ja,
  ...zh,
  ...ru,
  ...de,
  ...fr,
  ...nl,
  ...pt,
  ...id,
  ...es,
  ...it,
  ...tr,
  ...cs,
  ...sk,
]);

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
  @observable mergedMessages: null | {| [key: string]: string, |} = null;

  componentDidMount: () => void = () => {
    autorun(async () => {
      const locale = this.props.stores.profile.currentLocale;
      const _mergedMessages = {
        ...await translations['en-US'],
        ...await translations[locale]
      };
      runInAction(() => {
        this.mergedMessages = _mergedMessages;
      });
    });
    this.props.history.listen(({ pathname }) => {
      trackNavigation(pathname);
    });
  }

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

    const themeVars = Object.assign(stores.profile.currentThemeVars, {
      // show wingdings on dev builds when no font is set to easily find
      // missing font bugs. However, on production, we use Times New Roman
      // which looks ugly but at least it's readable.
      '--default-font': !environment.isProduction() ? 'wingdings' : 'Times New Roman',
    });
    const currentTheme = stores.profile.currentTheme;

    changeToplevelTheme(currentTheme);

    const muiTheme = MuiThemes[currentTheme];

    Logger.debug(`[yoroi] themes changed`);

    return (
      <div style={{ height: '100%' }}>
        <LayoutProvider layout={currentTheme}>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            {globalStyles(muiTheme)}
            <ThemeManager cssVariables={themeVars} />
            {/* Automatically pass a theme prop to all components in this subtree. */}
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
      return <CrashPage stores={stores} actions={actions} />;
    }
    if (stores.serverConnectionStore.isMaintenance) {
      return <MaintenancePage stores={stores} actions={actions} />;
    }
    return (
      <Router history={history}>
        <div style={{ height: '100%' }}>
          <Support />
          {Routes(stores, actions)}
        </div>
      </Router>
    );
  };
}

export default App;
