// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import InfoIcon from '../assets/images/info_icon.inline.svg';
import styles from './Settings.scss';
import { ROUTES } from '../routes-config';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { intlShape, defineMessages } from 'react-intl';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import FlagLabel from '../../components/widgets/FlagLabel';
import classNames from 'classnames';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import globalMessages, { connectorMessages } from '../../i18n/global-messages';

import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ArrowBack from '../assets/images/arrow_back.inline.svg';

const messages = defineMessages({
  about: {
    id: 'connector.settings.about',
    defaultMessage: '!!!About',
  },
  support: {
    id: 'connector.settings.support',
    defaultMessage: '!!!Support',
  },
  termOfServices: {
    id: 'connector.settings.termOfServices',
    defaultMessage: '!!!Term of Services',
  },
});

@observer
export default class Settings extends Component<any> {
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

    const navItems = [
      {
        label: intl.formatMessage(messages.about),
        icon: <InfoIcon />,
        route: '#',
      },
      {
        label: intl.formatMessage(connectorMessages.connectedWebsites),
        icon: <InfoIcon />,
        route: ROUTES.CONNECTED_WEBSITES,
      },
      {
        label: intl.formatMessage(messages.support),
        icon: <InfoIcon />,
        route: '#',
      },
      {
        label: intl.formatMessage(messages.termOfServices),
        icon: <InfoIcon />,
        route: '#',
      },
    ];

    const { languages, isSubmitting, error, goBack } = this.props;
    const { form } = this;
    const languageId = form.$('languageId');
    const languageOptions = languages.map(language => ({
      value: language.value,
      label: intl.formatMessage(language.label),
      svg: language.svg,
    }));
    const languageSelectClassNames = classNames([
      styles.language,
      isSubmitting ? styles.submitLanguageSpinner : null,
    ]);

    return (
      <div className={styles.layout}>
        <div className={styles.header}>
          <button onClick={goBack} type="button" className={styles.menuIcon}>
            <ArrowBack />
          </button>
          <div className={styles.menu}>
            <p className={styles.setting}>{intl.formatMessage(globalMessages.sidebarSettings)}</p>
          </div>
        </div>

        <ul className={styles.list}>
          {navItems.map(({ label, icon, route }) => (
            <li key={label} className={styles.listItem}>
              <Link to={route}>
                {icon}
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
          ))}
          <li className={styles.listItemLanguage}>
            <InfoIcon />
            <Select
              className={languageSelectClassNames}
              options={languageOptions}
              {...languageId.bind()}
              onChange={this.selectLanguage}
              skin={SelectSkin}
              optionRenderer={option => <FlagLabel svg={option.svg} label={option.label} />}
            />
            {error && <p className={styles.error}>{intl.formatMessage(error, error.values)}</p>}
          </li>
        </ul>
      </div>
    );
  }
}
