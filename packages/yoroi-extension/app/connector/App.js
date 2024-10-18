// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { RouterHistory } from 'react-router-dom';
import { Router } from 'react-router-dom';
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
import { autorun, observable, runInAction } from 'mobx';
import { Routes } from './Routes';
import { translations } from '../i18n/translations';
import type { StoresMap } from './stores';
import type { ActionsMap } from './actions';
import ThemeManager from '../ThemeManager';
import CrashPage from '../containers/CrashPage';
import { Logger } from '../utils/logging';
import { ThemeProvider } from '@mui/material/styles';
import { globalStyles } from '../styles/globalStyles';
import { CssBaseline } from '@mui/material';
import { changeToplevelTheme, MuiThemes } from '../styles/themes';

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
    const { stores, actions, history } = this.props;
    if (this.state.crashed === true) {
      return <CrashPage />;
    }
    return <Router history={history}>{Routes(stores, actions)}</Router>;
  };
}

export default App;
