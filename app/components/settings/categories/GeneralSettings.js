// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './GeneralSettings.scss';
import type { ReactIntlMessage } from '../../../types/i18nTypes';
import { version } from '../../../utils/logging';

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
  aboutYoroiTwitter: {
    id: 'settings.general.aboutYoroi.twitter',
    defaultMessage: '!!!Twitter',
    description: 'Label for Yoroi Twitter link.'
  },
  aboutYoroiGithub: {
    id: 'settings.general.aboutYoroi.github',
    defaultMessage: '!!!GitHub',
    description: 'Label for Yoroi GitHub link.'
  },
  aboutYoroiYoutube: {
    id: 'settings.general.aboutYoroi.youtube',
    defaultMessage: '!!!YouTube',
    description: 'Label for Yoroi YouTube link.'
  },
  aboutYoroiTelegramSupport: {
    id: 'settings.general.aboutYoroi.tgsupport',
    defaultMessage: '!!!Telegram community support',
    description: 'Label for Telegram Community Support group link.'
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

    const mkLink = (addr: string, text: ?string = addr) => (
      <a target="_blank" rel="noopener noreferrer" href={addr}>{text}</a>
    );

    return (
      <div className={componentClassNames}>

        <h1>{intl.formatMessage(messages.aboutYoroiLabel)}</h1>

        <div>
          <ul>
            <li>{intl.formatMessage(messages.aboutYoroiVersion)}: {mkLink(`https://github.com/Emurgo/yoroi-frontend/releases/tag/${version}`, version)}</li>
            <li>{intl.formatMessage(messages.aboutYoroiWebsite)}: {mkLink('https://yoroi-wallet.com')}</li>
            <li>{intl.formatMessage(messages.aboutYoroiBlog)}: {mkLink('https://medium.com/@emurgo_io')}</li>
            <li>{intl.formatMessage(messages.aboutYoroiTwitter)}: {mkLink('https://twitter.com/YoroiWallet')}</li>
            <li>{intl.formatMessage(messages.aboutYoroiGithub)}: {mkLink('https://github.com/Emurgo/yoroi-frontend')}</li>
            <li>{intl.formatMessage(messages.aboutYoroiYoutube)}: {mkLink('https://www.youtube.com/watch?v=GLNgpr-3t2E&list=PLFLTrdAG7xRZUmi04s44T1VEF20xKquF2')}</li>
            <li>{intl.formatMessage(messages.aboutYoroiTelegramSupport)}: {mkLink('https://t.me/CardanoCommunityTechSupport')}</li>
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
