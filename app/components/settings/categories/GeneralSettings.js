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
import ReactMarkdown from 'react-markdown';
import FlagLabel from '../../widgets/FlagLabel';
import { tier1Languages } from '../../../config/languagesConfig';

const messages = defineMessages({
  languageSelectLabel: {
    id: 'settings.general.languageSelect.label',
    defaultMessage: '!!!Language',
  },
  languageSelectInfo: {
    id: 'settings.general.languageSelect.info',
    defaultMessage: '!!!LanguageInfo',
  }
});

type Props = {
  languages: Array<{ value: string, label: ReactIntlMessage, svg: string }>,
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
    const { languages, isSubmitting, error, currentLocale } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const languageId = form.$('languageId');
    const languageOptions = languages.map(language => ({
      value: language.value,
      label: intl.formatMessage(language.label),
      svg: language.svg
    }));
    const componentClassNames = classNames([styles.component, 'general']);
    const languageSelectClassNames = classNames([
      styles.language,
      isSubmitting ? styles.submitLanguageSpinner : null,
    ]);
    return (
      <div className={componentClassNames}>

        <Select
          className={languageSelectClassNames}
          options={languageOptions}
          {...languageId.bind()}
          onChange={this.selectLanguage}
          skin={SelectSkin}
          optionRenderer={option => (
            <FlagLabel svg={option.svg} label={option.label} />
          )}
        />
        {error && <p className={styles.error}>{error}</p>}

        {!tier1Languages.includes(currentLocale) &&
          <div className={styles.info}>
            <h1>The selected language translation is fully provided by the community</h1>
            <p>{intl.formatMessage(messages.languageSelectInfo)}</p>
          </div>
        }

      </div>
    );
  }

}
