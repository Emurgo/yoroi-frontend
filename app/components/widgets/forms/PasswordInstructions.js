import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './PasswordInstructions.scss';
import { defineMessages, intlShape, MessageDescriptor } from 'react-intl';

type Props = {|
  instructionDescriptor?: MessageDescriptor
|};

const messages = defineMessages({
  passwordInstructions: {
    id: 'global.passwordInstructions',
    defaultMessage: '!!!Note: Spending password needs to be at least 12 characters long.',
  },
});

@observer
export default class PasswordInstructions extends Component<Props> {
  static defaultProps = {
    instructionDescriptor: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { instructionDescriptor } = this.props;

    const displayInstructionDescriptor = instructionDescriptor
      ? instructionDescriptor
      : messages.passwordInstructions;

    return (
      <p className={styles.component}>
        {intl.formatMessage(displayInstructionDescriptor)}
      </p>
    );
  }
}
