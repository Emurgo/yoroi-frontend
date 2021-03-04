// @flow

import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classnames from 'classnames';

import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import { isPinCodeValid } from '../../../../utils/validations';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';

import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';

import styles from './SetLockCodeDialog.scss';

import vjf from 'mobx-react-form/lib/validators/VJF';

const messages = defineMessages({
  currentCodeLabel: {
    id: 'settings.lock.current.label',
    defaultMessage: '!!!Current PIN code',
  },
  newCodeLabel: {
    id: 'settings.lock.new.label',
    defaultMessage: '!!!New PIN code',
  },
  repeatCodeLabel: {
    id: 'settings.lock.repeat.label',
    defaultMessage: '!!!Repeat PIN code',
  },
  submitLabel: {
    id: 'settings.lock.submit',
    defaultMessage: '!!!Submit',
  },
  lengthError: {
    id: 'settings.lock.length.error',
    defaultMessage: '!!!The PIN code should contain at least 6 characters.',
  },
  matchError: {
    id: 'settings.lock.match-repeat.error',
    defaultMessage: '!!!The PIN codes don\'t match',
  },
  currentError: {
    id: 'lock-screen.pin.error',
    defaultMessage: '!!!Incorrect PIN code',
  },
  note: {
    id: 'settings.lock.note',
    defaultMessage: '!!!Note the screen lock code is separate from your spending password',
  },
});

type Props = {|
  close: void => void,
  title: string,
  requestCurrent: boolean,
  pin: ?string,
  submit: string => void,
|};

@observer
export default class SetLockCodeDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
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
                isPinCodeValid(field.value, this.props.pin ?? ''),
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
    plugins: {
      vjf: vjf()
    },
  });

  handleSubmit: void => void = () => {
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

  handleKeyPress: KeyboardEvent => void = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.handleSubmit();
    }
  }

  render(): Node {
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
            skin={InputSkin}
          />
        )}
        <div className={styles.lockPassword}>
          <div className={fieldsClasses}>
            <Input
              className={styles.input}
              {...newCode.bind()}
              error={newCode.error}
              onKeyPress={this.handleKeyPress}
              skin={InputSkin}
            />
            <Input
              className={styles.input}
              {...repeatNewCode.bind()}
              error={repeatNewCode.error}
              onKeyPress={this.handleKeyPress}
              skin={InputSkin}
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
