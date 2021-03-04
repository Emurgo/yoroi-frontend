// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';

import Dialog from '../widgets/Dialog';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import { isPinCodeValid } from '../../utils/validations';

import LockIcon from '../../assets/images/locked.inline.svg';

import styles from './LockScreen.scss';

import vjf from 'mobx-react-form/lib/validators/VJF';

const messages = defineMessages({
  errorLabel: {
    id: 'lock-screen.pin.error',
    defaultMessage: '!!!Incorrect PIN code',
  },
  label: {
    id: 'lock-screen.pin.label',
    defaultMessage: '!!!PIN code',
  },
  title: {
    id: 'lock-screen.title',
    defaultMessage: '!!!Unlock the screen',
  },
  button: {
    id: 'lock-screen.button',
    defaultMessage: '!!!Unlock',
  },
});

type Props = {|
  pin: string,
  unlock: void => void,
|};

type State = {|
  dialogIsOpen: boolean,
|};

@observer
export default class LockScreen extends Component<Props, State> {
  state: State = {
    dialogIsOpen: false,
  }

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  openDialog: void => void = () => {
    this.setState({ dialogIsOpen: true });
  }

  handleSubmit: void => void = () => {
    this.form.submit({
      onSuccess: () => {
        this.props.unlock();
      },
      onError: () => {
        console.log('error');
      },
    });
  }

  handleKeyPress: KeyboardEvent => void = (event) => {
    if (event.key === 'Enter') {
      this.handleSubmit();
    }
  }

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      code: {
        label: this.context.intl.formatMessage(messages.label),
        type: 'password',
        placeholder: '',
        value: '',
        validators: [({ field }) => {
          if (field.value.length >= 6) {
            return [
              isPinCodeValid(field.value, this.props.pin),
              this.context.intl.formatMessage(messages.errorLabel),
            ];
          }
          return [false, this.context.intl.formatMessage(messages.errorLabel)];
        }],
      },
    },
  }, {
    options: {
      validateOnChange: false,
    },
    plugins: {
      vjf: vjf()
    },
  });

  render(): Node {
    const { dialogIsOpen } = this.state;
    const actions = [
      {
        label: this.context.intl.formatMessage(messages.button),
        primary: true,
        onClick: this.handleSubmit,
      },
    ];
    const code = this.form.$('code');
    return (
      <div className={styles.container}>
        <button type="button" className={styles.unlock} onClick={this.openDialog}>
          <LockIcon />
        </button>
        {dialogIsOpen && (
          <Dialog
            title={this.context.intl.formatMessage(messages.title)}
            closeOnOverlayClick={false}
            actions={actions}
          >
            <Input
              skin={InputSkin}
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
