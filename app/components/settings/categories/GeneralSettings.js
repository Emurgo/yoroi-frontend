// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import {defineMessages, FormattedMessage, intlShape} from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './GeneralSettings.scss';
import type { ReactIntlMessage } from '../../../types/i18nTypes';

const messages = defineMessages({
  aboutYoroiLabel: {
    id: 'settings.general.aboutYoroi.label',
    defaultMessage: '!!!About Yoroi',
    description: 'Label for the About Yoroi section.'
  },
  aboutYoroiVersion: {
    id: 'settings.general.aboutYoroi.version',
    defaultMessage: '!!!Yoroi version',
    description: 'Label for current Yoroi version.'
  },
  aboutYoroiWebsite: {
    id: 'settings.general.aboutYoroi.website',
    defaultMessage: '!!!Website',
    description: 'Label for Yoroi website link.'
  },
  aboutYoroiBlog: {
    id: 'settings.general.aboutYoroi.blog',
    defaultMessage: '!!!Emurgo blog',
    description: 'Label for Emurgo blog link.'
  },
  generalSettingsLabel: {
    id: 'settings.general.generalSettings.label',
    defaultMessage: '!!!General Settings',
    description: 'Label for the General Settings section.'
  },
  languageSelectLabel: {
    id: 'settings.general.languageSelect.label',
    defaultMessage: '!!!Language',
    description: 'Label for the language select.'
  },
});

type Props = {
  languages: Array<{ value: string, label: ReactIntlMessage }>,
  currentLocale: string,
  onSelectLanguage: Function,
  isSubmitting: boolean,
  error?: ?LocalizableError,
};

@observer
export default class GeneralSettings extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  selectLanguage = (values: { locale: string }) => {
    this.props.onSelectLanguage({ locale: values });
  };

  form = new ReactToolboxMobxForm({
    fields: {
      languageId: {
        label: this.context.intl.formatMessage(messages.languageSelectLabel),
        value: this.props.currentLocale,
      }
    }
  }, {
    options: {
      validateOnChange: false,
    },
  });

  render() {
    const { languages, isSubmitting, error } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const languageId = form.$('languageId');
    const languageOptions = languages.map(language => ({
      value: language.value,
      label: intl.formatMessage(language.label)
    }));
    const componentClassNames = classNames([styles.component, 'general']);
    const languageSelectClassNames = classNames([
      styles.language,
      isSubmitting ? styles.submitLanguageSpinner : null,
    ]);

    return (
      <div className={componentClassNames}>

        <h1>{intl.formatMessage(messages.aboutYoroiLabel)}</h1>

        <div>
          <ul>
            <li>{intl.formatMessage(messages.aboutYoroiVersion)}: <a target={'_blank'} href={'https://github.com/Emurgo/yoroi-frontend/releases/tag/1.2.0'}>1.2.0</a></li>
            <li>{intl.formatMessage(messages.aboutYoroiWebsite)}: <a target={'_blank'} href={'https://yoroi-wallet.com'}>https://yoroi-wallet.com</a></li>
            <li>{intl.formatMessage(messages.aboutYoroiBlog)}: <a target={'_blank'} href={'https://medium.com/@emurgo_io'}>https://medium.com/@emurgo_io</a></li>
          </ul>
        </div>

        <h1>{intl.formatMessage(messages.generalSettingsLabel)}</h1>

        <Select
          className={languageSelectClassNames}
          options={languageOptions}
          {...languageId.bind()}
          onChange={this.selectLanguage}
          skin={SelectSkin}
        />

        {error && <p className={styles.error}>{error}</p>}

      </div>
    );
  }

}
