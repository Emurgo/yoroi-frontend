// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import Checkbox from 'react-polymorph/lib/components/Checkbox';
import CheckboxSkin from 'react-polymorph/lib/skins/simple/raw/CheckboxSkin';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';

import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './LockScreenSettings.scss';
import type { ReactIntlMessage } from '../../../types/i18nTypes';

const messages = defineMessages({
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

type State = {
  checked: boolean,
}

@observer
export default class LockScreenSettings extends Component<Props, State> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    checked: false,
  };

  handleCheck = () => {
    this.setState({ checked: !this.state.checked });
  }

  handleSubmit = () => {
    console.log('submitted!');
  }

  selectLanguage = (values: { locale: string }) => {
    this.props.onSelectLanguage({ locale: values });
  };

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
    const { languages, isSubmitting, error } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const currentCode = form.$('currentCode');
    const newCode = form.$('newCode');
    const repeatNewCode = form.$('repeatNewCode');

    const componentClassNames = classNames([styles.component, 'general']);

    const actions = [
      {
        label: 'test',
        primary: true,
        onClick: this.handleSubmit,
      },
    ];

    return (
      <div className={componentClassNames}>
        <div className={`${styles.enabling} ${styles.row}`}>
          <span className={styles.title}>Enable lock screen</span>
          <Checkbox
            className={styles.checkbox}
            skin={<CheckboxSkin />}
            checked={this.state.checked}
            onChange={this.handleCheck}
          />
        </div>

        {this.state.checked && (
          <div className={styles.row}>
            <div className={styles.title}>Change PIN code</div>
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

        <Dialog
          title="Set your pin code"
          closeOnOverlayClick={false}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
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
        </Dialog>;

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