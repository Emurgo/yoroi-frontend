import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import SvgInline from 'react-svg-inline';

import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';

import Dialog from '../widgets/Dialog';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import { isPinCodeValid } from '../../utils/validations';

import lockIcon from '../../assets/images/locked.inline.svg';

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
      onSuccess: () => {
        this.props.unlock.trigger();
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
          return [false, this.props.intl.formatMessage(messages.errorLabel)];
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
        <button type="button" className={styles.unlock} onClick={this.openDialog}>
          <SvgInline svg={lockIcon} cleanup={['title']} />
        </button>
        {dialogIsOpen && (
          <Dialog
            title={this.props.intl.formatMessage(messages.title)}
            closeOnOverlayClick={false}
            actions={actions}
          >
            <Input
              skin={<SimpleInputSkin />}
              {...code.bind()}
              onKeyPress={this.handleKeyPress}
              error={code.error}
            />
          </Dialog>
        )}
      </div>
    );
  }
}
