// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import Checkbox from 'react-polymorph/lib/components/Checkbox';
import CheckboxSkin from 'react-polymorph/lib/skins/simple/raw/CheckboxSkin';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';

import SetLockCodeDialog from './SetLockCodeDialog';

import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './LockScreenSettings.scss';
import type { ReactIntlMessage } from '../../../../types/i18nTypes';

const messages = defineMessages({
  checkboxLabel: {
    id: 'settings.lock.enable.label',
    defaultMessage: '!!!Enable lock screen',
    description: 'Label for the lock enabling checkbox.'
  },
  submitLabel: {
    id: 'settings.lock.submit',
    defaultMessage: '!!!Submit',
    description: 'Label for submit pin code button',
  },
  change: {
    id: 'settings.lock.change',
    defaultMessage: '!!!Change PIN code',
    description: 'Title for changing PIN code form',
  },
});

type Props = {
  toggleLockScreen: Function,
  close: Function,
  submit: Function,
  isEnabled: boolean,
  isSubmitting: boolean,
  pin: string,
  error?: ?LocalizableError,
};

@observer
export default class LockScreenSettings extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  handleSubmit = () => {
    console.log('submitted!');
  }


  form = new ReactToolboxMobxForm({
    fields: {
      currentCode: {
        label: 'Current PIN code',
        placeholder: '',
        value: '',
        validators: [({ field }) => (
          []
        )],
      },
      newCode: {
        label: 'New PIN code',
        placeholder: '',
        value: '',
        validators: [({ field }) => (
          []
        )],
      },
      repeatNewCode: {
        label: 'Repeat new PIN code',
        placeholder: '',
        value: '',
        validators: [({ field }) => (
          []
        )],
      }
    },
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: 250,
    },
  });

  render() {
    const {
      toggleLockScreen,
      close,
      submit,
      isSubmitting,
      isEnabled,
      error,
      pin,
    } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const currentCode = form.$('currentCode');
    const newCode = form.$('newCode');
    const repeatNewCode = form.$('repeatNewCode');

    const componentClassNames = classNames([styles.component, 'general']);

    return (
      <div className={componentClassNames}>
        <div className={`${styles.enabling} ${styles.row}`}>
          <span className={styles.title}>{intl.formatMessage(messages.checkboxLabel)}</span>
          <Checkbox
            className={styles.checkbox}
            skin={<CheckboxSkin />}
            checked={isEnabled}
            onChange={toggleLockScreen}
          />
        </div>

        {pin && isEnabled && (
          <div className={styles.row}>
            <div className={styles.title}>{intl.formatMessage(messages.change)}</div>
            <Input
              className={styles.input}
              {...currentCode.bind()}
              error={currentCode.error}
              skin={<SimpleInputSkin />}
            />
            <Input
              className={styles.input}
              {...newCode.bind()}
              error={newCode.error}
              skin={<SimpleInputSkin />}
            />
            <Input
              className={styles.input}
              {...repeatNewCode.bind()}
              error={repeatNewCode.error}
              skin={<SimpleInputSkin />}
            />
          </div>
        )}

        {!pin && isEnabled && <SetLockCodeDialog close={close} submit={submit} />}

        {error && <p className={styles.error}>{error}</p>}

      </div>
    );
  }

}

/*
<Select
          className={languageSelectClassNames}
          options={languageOptions}
          {...languageId.bind()}
          onChange={this.selectLanguage}
          skin={<SelectSkin />}
        />
        */