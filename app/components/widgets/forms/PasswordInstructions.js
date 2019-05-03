import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './PasswordInstructions.scss';
import { defineMessages, intlShape } from 'react-intl';

type Props = {
  isClassicThemeActive: boolean
};

const messages = defineMessages({
  passwordInstructions: {
    id: 'global.passwordInstructions',
    defaultMessage: '!!!Note: Spending password needs to be at least 12 characters long.',
  },
});

@observer
export default class PasswordInstructions extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { isClassicThemeActive } = this.props;

    const passwordInstructionsClasses = isClassicThemeActive
      ? styles.passwordInstructionsClassic
      : styles.passwordInstructions;

    return (
      <p className={passwordInstructionsClasses}>
        {intl.formatMessage(messages.passwordInstructions)}
      </p>
    );
  }
}
