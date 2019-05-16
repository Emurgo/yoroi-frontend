// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Select } from 'react-polymorph/lib/components/Select';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './LanguageSelectionForm.scss';
import type { ReactIntlMessage } from '../../../types/i18nTypes';
import FlagLabel from '../../widgets/FlagLabel';
import { tier1Languages } from '../../../config/languagesConfig';

const messages = defineMessages({
  languageSelectLabel: {
    id: 'profile.languageSelect.form.languageSelectLabel',
    defaultMessage: '!!!Select your language',
  },
  submitLabel: {
    id: 'profile.languageSelect.form.submitLabel',
    defaultMessage: '!!!Continue',
  },
  languageSelectLabelInfo: {
    id: 'settings.general.languageSelect.labelInfo',
    defaultMessage: '!!!LanguageLabelInfo',
  },
  languageSelectInfo: {
    id: 'settings.general.languageSelect.info',
    defaultMessage: '!!!LanguageInfo',
  },
  languageSelectThanking: {
    id: 'settings.general.languageSelect.thanking',
    defaultMessage: '!!!Thanks to the following',
  },
  languageSelectContributors: {
    id: 'settings.general.languageSelect.contributors',
    defaultMessage: '!!!contributors',
  },
});

type Props = {
  languages: Array<{ value: string, label: ReactIntlMessage, svg: string }>,
  onSelectLanguage: Function,
  onSubmit: Function,
  isSubmitting: boolean,
  currentLocale: string,
  error?: ?LocalizableError,
};

@observer
export default class LanguageSelectionForm extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  selectLanguage = (values: { locale: string }) => {
    this.props.onSelectLanguage({ locale: values });
  };

  submit = () => {
    this.form.submit({
      onSuccess: (form) => {
        const { languageId } = form.values();
        this.props.onSubmit({ locale: languageId });
      },
      onError: () => {}
    });
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
    const { intl } = this.context;
    const { form } = this;
    const { languages, isSubmitting, currentLocale, error } = this.props;
    const languageId = form.$('languageId');
    const languageOptions = languages.map(language => ({
      value: language.value,
      label: intl.formatMessage(language.label),
      svg: language.svg
    }));
    const buttonClasses = classnames([
      'primary',
      isSubmitting ? styles.submitButtonSpinning : styles.submitButton,
    ]);
    const contributors = intl.formatMessage(messages.languageSelectContributors);
    let contributorsMessage = ' ';
    if (contributors !== messages.languageSelectContributors.defaultMessage) {
      contributorsMessage += intl.formatMessage(messages.languageSelectThanking);
      contributorsMessage += contributors;
    }

    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>

          <Select
            className={styles.languageSelect}
            options={languageOptions}
            value={currentLocale}
            {...languageId.bind()}
            skin={SelectSkin}
            onChange={this.selectLanguage}
            optionRenderer={option => (
              <FlagLabel svg={option.svg} label={option.label} />
            )}
          />

          {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

          <Button
            className={buttonClasses}
            label={intl.formatMessage(messages.submitLabel)}
            onMouseUp={this.submit}
            skin={ButtonSkin}
          />

          {!tier1Languages.includes(currentLocale) &&
            <div className={styles.info}>
              <h1>{intl.formatMessage(messages.languageSelectLabelInfo)}</h1>
              <p>
                {intl.formatMessage(messages.languageSelectInfo)}
                {contributorsMessage}
              </p>
            </div>
          }

        </div>
      </div>
    );
  }

}
