import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';

import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import { isPinCodeValid } from '../../../../utils/validations';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';

import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';

import styles from './SetLockCodeDialog.scss';

const messages = defineMessages({
  currentCodeLabel: {
    id: 'settings.lock.current.label',
    defaultMessage: '!!!Current PIN code',
    description: 'Label for current pin code input',
  },
  newCodeLabel: {
    id: 'settings.lock.new.label',
    defaultMessage: '!!!New PIN code',
    description: 'Label for the new pin code input.'
  },
  repeatCodeLabel: {
    id: 'settings.lock.repeat.label',
    defaultMessage: '!!!Repeat PIN code',
    description: 'Label for the repeat pin code input'
  },
  submitLabel: {
    id: 'settings.lock.submit',
    defaultMessage: '!!!Submit',
    description: 'Label for submit pin code button',
  },
  lengthError: {
    id: 'settings.lock.length.error',
    defaultMessage: '!!!The PIN code should contain at least 6 characters.',
    description: 'Error message for new pin code',
  },
  matchError: {
    id: 'settings.lock.match-repeat.error',
    defaultMessage: '!!!The PIN codes don\'t match',
    description: 'Error message for repeating pin code',
  },
  currentError: {
    id: 'lock-screen.pin.error',
    defaultMessage: '!!!Incorrect PIN code',
    description: 'Error message for incorrect pin code',
  },
  note: {
    id: 'settings.lock.note',
    defaultMessage: '!!!Note that pin code can be used only for a lock screen',
    description: 'A note for user about the pin code',
  },
});

@observer
export default class SetLockCodeDialog extends Component {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  form = new ReactToolboxMobxForm({
    fields: {
      ...this.props.requestCurrent && {
        currentCode: {
          label: this.context.intl.formatMessage(messages.currentCodeLabel),
          type: 'password',
          placeholder: '',
          value: '',
          validators: [({ field }) => {
            if (field.value.length >= 6) {
              return [
                isPinCodeValid(field.value, this.props.pin),
                this.context.intl.formatMessage(messages.currentError),
              ];
            }
            return [false, this.context.intl.formatMessage(messages.currentError)];
          }],
        },
      },
      newCode: {
        label: this.context.intl.formatMessage(messages.newCodeLabel),
        type: 'password',
        placeholder: '',
        value: '',
        validators: [({ field }) => {
          if (field.value.length < 6) {
            return [
              false,
              this.context.intl.formatMessage(messages.lengthError),
            ];
          }
          return [true];
        }],
      },
      repeatNewCode: {
        label: this.context.intl.formatMessage(messages.repeatCodeLabel),
        type: 'password',
        placeholder: '',
        value: '',
        validators: [({ field, form }) => {
          const code = form.$('newCode').value;
          if (!code.length && !field.value) return [true];
          if (code !== field.value) {
            return [
              false,
              this.context.intl.formatMessage(messages.matchError),
            ];
          }
          return [true];
        }],
      }
    },
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: 250,
    },
  });

  handleSubmit = () => {
    console.log('submitted');
    this.form.submit({
      onSuccess: (form) => {
        const { newCode } = form.values();
        this.props.submit(newCode);
      },
      onError: () => {
        console.log('error');
      },
    });
  }

  handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.handleSubmit();
    }
  }

  render() {
    const { close, title, requestCurrent } = this.props;
    const { intl } = this.context;

    const actions = [
      {
        label: intl.formatMessage(messages.submitLabel),
        primary: true,
        onClick: this.handleSubmit,
      },
    ];
    const newCode = this.form.$('newCode');
    const repeatNewCode = this.form.$('repeatNewCode');

    const fieldsClasses = classnames([
      styles.lockPasswordFields,
      styles.show,
    ]);

    return (
      <Dialog
        title={title}
        closeOnOverlayClick={false}
        actions={actions}
        closeButton={<DialogCloseButton />}
        onClose={close}
      >
        {requestCurrent && (
          <Input
            className={styles.input}
            {...this.form.$('currentCode').bind()}
            error={this.form.$('currentCode').error}
            onKeyPress={this.handleKeyPress}
            skin={<SimpleInputSkin />}
          />
        )}
        <div className={styles.lockPassword}>
          <div className={fieldsClasses}>
            <Input
              className={styles.input}
              {...newCode.bind()}
              error={newCode.error}
              onKeyPress={this.handleKeyPress}
              skin={<SimpleInputSkin />}
            />
            <Input
              className={styles.input}
              {...repeatNewCode.bind()}
              error={repeatNewCode.error}
              onKeyPress={this.handleKeyPress}
              skin={<SimpleInputSkin />}
            />
            <p className={styles.note}>
              {intl.formatMessage(messages.note)}
            </p>
          </div>
        </div>
      </Dialog>
    );
  }
}
