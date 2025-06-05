// @flow
import type { Node } from 'react';
import type { StoresMap } from './stores';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { HashRouter as Router } from 'react-router';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ko from 'react-intl/locale-data/ko';
import ja from 'react-intl/locale-data/ja';
import zh from 'react-intl/locale-data/zh';
import ru from 'react-intl/locale-data/ru';
import de from 'react-intl/locale-data/de';
import fr from 'react-intl/locale-data/fr';
import pt from 'react-intl/locale-data/pt';
import id from 'react-intl/locale-data/id';
import es from 'react-intl/locale-data/es';
import vi from 'react-intl/locale-data/vi';
import { autorun, observable, runInAction } from 'mobx';
import { YoroiRoutes } from './Routes';
import { translations } from '../i18n/translations';
import ThemeManager from '../ThemeManager';
import CrashPage from '../containers/CrashPage';
import { Logger } from '../utils/logging';
import { globalStyles } from '../styles/globalStyles';
import { CssBaseline } from '@mui/material';
import { changeToplevelTheme, MuiThemes } from '../styles/themes';
import { ColorModeProvider } from '../styles/context/mode';
// $FlowIgnore: suppressing this error
import { IntlProviderWrapper, IntlContextProvider } from '../UI/common/context/IntlContextProvider';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([
  ...en,
  ...ko,
  ...ja,
  ...zh,
  ...ru,
  ...de,
  ...fr,
  ...pt,
  ...id,
  ...es,
  ...vi,
]);

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
    changeToplevelTheme(currentTheme);
    const muiTheme = MuiThemes[currentTheme];
    Logger.debug(`[yoroi] themes changed`);

    return (
      <div style={{ height: '100%', backgroundColor: 'var(--yoroi-palette-gray-50)' }}>
        <ColorModeProvider>
          <CssBaseline />
          {globalStyles(muiTheme)}
          <ThemeManager />
          <IntlProviderWrapper locale={locale} key={locale} messages={mergedMessages}>
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
    return (
      <Router>
        <IntlContextProvider>
          <YoroiRoutes stores={stores} />
        </IntlContextProvider>
      </Router>
    );
  };
}

export default App;
