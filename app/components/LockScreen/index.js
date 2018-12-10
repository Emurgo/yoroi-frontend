import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';

import Dialog from '../widgets/Dialog';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import { isPinCodeValid } from '../../utils/validations';

import styles from './LockScreen.scss';

const messages = defineMessages({
  errorLabel: {
    id: 'lock-screen.pin.error',
    defaultMessage: '!!!Incorrect PIN code',
    description: 'Error message for incorrect pin code',
  },
  label: {
    id: 'lock-screen.pin.label',
    defaultMessage: '!!!PIN code',
    description: 'Label for pin code input',
  },
  title: {
    id: 'lock-screen.title',
    defaultMessage: '!!!Unlock the screen',
    description: 'A title for lock screen dialog'
  },
  button: {
    id: 'lock-screen.button',
    defaultMessage: '!!!Unlock',
    description: 'A button text',
  },
});

@injectIntl @observer
export default class LockScreen extends Component {
  state = {
    dialogIsOpen: false,
  }

  openDialog = () => {
    this.setState({ dialogIsOpen: true });
  }
  handleSubmit = () => {
    this.form.submit({
      onSuccess: (form) => {
        this.props.unlock.trigger();
      },
      onError: () => {
        console.log('error');
      },
    });
  }

  form = new ReactToolboxMobxForm({
    fields: {
      code: {
        label: this.props.intl.formatMessage(messages.label),
        type: 'password',
        placeholder: '',
        value: '',
        validators: [({ field }) => {
          if (field.value.length >= 6) {
            return [
              isPinCodeValid(field.value, this.props.pin),
              this.props.intl.formatMessage(messages.errorLabel),
            ];
          }
          return [false];
        }],
      },
    },
  }, {
    options: {
      validateOnChange: false,
    },
  });

  render() {
    const { dialogIsOpen } = this.state;
    const actions = [
      {
        label: this.props.intl.formatMessage(messages.button),
        primary: true,
        onClick: this.handleSubmit,
      },
    ];
    const code = this.form.$('code');
    return (
      <div className={styles.container}>
        <div className={styles.placeholder} onClick={this.openDialog} />
        {dialogIsOpen && (
          <Dialog
            title={this.props.intl.formatMessage(messages.title)}
            closeOnOverlayClick={false}
            actions={actions}
          >
            <Input
              skin={<SimpleInputSkin />}
              {...code.bind()}
              error={code.error}
            />
          </Dialog>
        )}
      </div>
    );
  }
}
