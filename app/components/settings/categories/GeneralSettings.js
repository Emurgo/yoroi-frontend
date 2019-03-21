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
import ChangeWalletPasswordDialog from '../../wallet/settings/ChangeWalletPasswordDialog';
import type { Node } from 'react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

const messages = defineMessages({
  languageSelectLabel: {
    id: 'settings.general.languageSelect.label',
    defaultMessage: '!!!Language',
  },
  createPaperLabel: {
    id: 'settings.general.createPaper.label',
    defaultMessage: '!!!Create Yoroi Paper Wallet',
    description: 'Label for the paper wallet creation button.'
  },
});

type Props = {
  languages: Array<{ value: string, label: ReactIntlMessage }>,
  currentLocale: string,
  onSelectLanguage: Function,
  isSubmitting: boolean,
  error?: ?LocalizableError,
  openDialogAction: Function,
  isDialogOpen: Function,
  dialog: Node,
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
    const { languages, isSubmitting, error, openDialogAction, isDialogOpen, dialog } = this.props;
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
    const buttonClasses = classNames([
      'transferButton',
      isSubmitting ? styles.isSubmitting : 'primary',
      styles.button,
    ]);
    return (
      <div className={componentClassNames}>

        <Select
          className={languageSelectClassNames}
          options={languageOptions}
          {...languageId.bind()}
          onChange={this.selectLanguage}
          skin={SelectSkin}
        />

        <br />

        <Button
          className={buttonClasses}
          label={intl.formatMessage(messages.createPaperLabel)}
          onClick={() => openDialogAction({
            dialog: ChangeWalletPasswordDialog
          })}
          skin={ButtonSkin}
        />

        {isDialogOpen(ChangeWalletPasswordDialog) ? (
          <div>{dialog}</div>
        ) : null}

        {error && <p className={styles.error}>{error}</p>}

      </div>
    );
  }

}
