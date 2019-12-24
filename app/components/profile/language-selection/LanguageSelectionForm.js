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
import type { MessageDescriptor } from 'react-intl';
import FlagLabel from '../../widgets/FlagLabel';
import { tier1Languages } from '../../../config/languagesConfig';
import globalMessages, { listOfTranslators } from '../../../i18n/global-messages';

const messages = defineMessages({
  submitLabel: {
    id: 'profile.languageSelect.form.submitLabel',
    defaultMessage: '!!!Continue',
  },
});

type Props = {|
  +onSelectLanguage: {| locale: string |} => void,
  +languages: Array<{ value: string, label: MessageDescriptor, svg: string }>,
  +onSubmit: {| locale: string |} => void,
  +isSubmitting: boolean,
  +currentLocale: string,
  +error?: ?LocalizableError,
|};

@observer
export default class LanguageSelectionForm extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  selectLanguage = (locale: string) => {
    this.props.onSelectLanguage({ locale });
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
        label: this.context.intl.formatMessage(globalMessages.languageSelectLabel),
        value: this.props.currentLocale,
      }
    }
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
              <h1>{intl.formatMessage(globalMessages.languageSelectLabelInfo)}</h1>
              <p>
                {intl.formatMessage(globalMessages.languageSelectInfo)}
                {' '}
                {listOfTranslators(intl.formatMessage(globalMessages.translationContributors),
                  intl.formatMessage(globalMessages.translationAcknowledgment))}
              </p>
            </div>
          }

        </div>
      </div>
    );
  }

}
