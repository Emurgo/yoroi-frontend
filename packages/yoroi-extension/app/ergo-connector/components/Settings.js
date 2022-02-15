// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { Link } from 'react-router-dom';
import Select from '../../components/common/Select';
import { MenuItem } from '@mui/material';
import { Box } from '@mui/system';
import { intlShape } from 'react-intl';

import styles from './Settings.scss';
import { ROUTES } from '../routes-config';
import { observer } from 'mobx-react';
import FlagLabel from '../../components/widgets/FlagLabel';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import globalMessages, { connectorMessages } from '../../i18n/global-messages';
import InfoIcon from '../assets/images/info_icon.inline.svg';
import SupportIcon from '../assets/images/support_icon.inline.svg';
import TermsUseIcon from '../assets/images/terms_of_use_icon.inline.svg';
import LanguageIcon from '../assets/images/language_icon.inline.svg';
import ConnectedIcon from '../assets/images/connected_icon.inline.svg';
import SendIcon from '../assets/images/send.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { LanguageType } from '../../i18n/translations';
import LocalizableError from '../../i18n/LocalizableError';

type Props = {|
  +languages: Array<LanguageType>,
  +currentLocale: string,
  +onSelectLanguage: ({| locale: string |}) => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

@observer
export default class Settings extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      languageId: {
        value: this.props.currentLocale,
      },
    },
  });

  selectLanguage: string => Promise<void> = async locale => {
    await this.props.onSelectLanguage({ locale });
  };
  render(): Node {
    const { intl } = this.context;
    const { signingMessage } = this.props

    const navItems = [
      {
        label: intl.formatMessage(connectorMessages.about),
        icon: <InfoIcon />,
        route: ROUTES.SETTINGS.ABOUT,
      },
      {
        label: intl.formatMessage(connectorMessages.connectedWebsites),
        icon: <ConnectedIcon />,
        route: ROUTES.CONNECTED_WEBSITES,
      },
      {
        label: intl.formatMessage(connectorMessages.signTransaction),
        icon: <SendIcon />,
        route: ROUTES.SIGNIN_TRANSACTION,
        shouldHide: signingMessage === null,
      },
      {
        label: intl.formatMessage(connectorMessages.connect),
        icon: <SendIcon />,
        route: ROUTES.ROOT,
        shouldHide: false,
      },
      {
        label: intl.formatMessage(globalMessages.support),
        icon: <SupportIcon />,
        route: ROUTES.SETTINGS.SUPPORT,
      },
      {
        label: intl.formatMessage(globalMessages.termsOfUse),
        icon: <TermsUseIcon />,
        route: ROUTES.SETTINGS.TERMS_OF_USE,
      },
    ];

    const { languages, isSubmitting, error } = this.props;
    const { form } = this;
    const languageId = form.$('languageId');
    const languageOptions = languages.map(language => ({
      value: language.value,
      label: intl.formatMessage(language.label),
      svg: language.svg,
    }));

    return (
      <ul className={styles.list}>
        {navItems.filter(({ shouldHide }) => !shouldHide).map(({ label, icon, route }) => (
          <li key={label} className={styles.listItem}>
            <Link to={route}>
              {icon}
              <span className={styles.label}>{label}</span>
            </Link>
          </li>
        ))}
        <li className={styles.listItemLanguage}>
          <LanguageIcon />
          <Select
            {...languageId.bind()}
            onChange={this.selectLanguage}
            disabled={isSubmitting}
            renderValue={value => (
              <Box>{languageOptions.filter(option => option.value === value)[0].label}</Box>
            )}
            formControlProps={{
              sx: {
                marginTop: '-9px',
                '& .MuiOutlinedInput-root fieldset': {
                  border: 'transparent',
                },
              },
            }}
            menuProps={{
              sx: {
                '& .MuiMenu-paper': {
                  maxHeight: '280px',
                },
              },
            }}
          >
            {languageOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                <FlagLabel svg={option.svg} label={option.label} />
              </MenuItem>
            ))}
          </Select>
          {error && <p className={styles.error}>{intl.formatMessage(error, error.values)}</p>}
        </li>
      </ul>
    );
  }
}
