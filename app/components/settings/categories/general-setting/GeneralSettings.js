// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './GeneralSettings.scss';
import type { MessageDescriptor } from 'react-intl';
import FlagLabel from '../../../widgets/FlagLabel';
import { tier1Languages } from '../../../../config/languagesConfig';
import globalMessages, { listOfTranslators } from '../../../../i18n/global-messages';

type Props = {|
  languages: Array<{ value: string, label: MessageDescriptor, svg: string }>,
  currentLocale: string,
  onSelectLanguage: Function,
  isSubmitting: boolean,
  error?: ?LocalizableError,
|};

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
        label: this.context.intl.formatMessage(globalMessages.languageSelectLabel),
        value: this.props.currentLocale,
      }
    }
  });

  render() {
    const { languages, isSubmitting, error } = this.props;
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
        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

        {!tier1Languages.includes(languageId.value) &&
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
    );
  }

}
