// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import DialogBackButton from '../../widgets/DialogBackButton';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import WalletRecoveryInstructions from '../backup-recovery/WalletRecoveryInstructions';
import globalMessages from '../../../i18n/global-messages';
import styles from './LegacyExplanation.scss';
import RecoveryWatchingSvg from '../../../assets/images/recovery-watching.inline.svg';

const messages = defineMessages({
  legacyExplanation: {
    id: 'wallet.backup.dialog.legacy.explanation',
    defaultMessage: `!!!If you had any ADA in your wallet on November 29th, 2019
    you have to upgrade your wallet to a Shelley "reward wallet".`
  },
  checkConfirm: {
    id: 'wallet.backup.dialog.legacy.checkConfirm',
    defaultMessage: `!!!Do you want to check if your wallet needs to be upgraded?`
  },
});

type Props = {|
  +onBack: void => void,
  +onClose: void => void,
  +onSkip: void => PossiblyAsync<void>,
  +onCheck: void => PossiblyAsync<void>,
  +classicTheme: boolean,
  +isSubmitting: boolean,
|};

@observer
export default class LegacyExplanation extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      classicTheme
    } = this.props;
    const dialogClasses = classnames([
      styles.component,
      'LegacyExplanation',
    ]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.skipLabel),
        className: classnames([this.props.isSubmitting ? styles.isSubmitting : null]),
        onClick: this.props.onSkip,
        primary: false,
        isSubmitting: this.props.isSubmitting,
      },
      {
        label: intl.formatMessage(globalMessages.checkLabel),
        onClick: this.props.onCheck,
        primary: true,
        disabled: this.props.isSubmitting,
      }
    ];

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(globalMessages.walletUpgrade)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onClose}
        closeButton={<DialogCloseButton onClose={this.props.onClose} />}
        backButton={<DialogBackButton onBack={this.props.onBack} />}
      >
        {!classicTheme && <span className={styles.recoveryImage}><RecoveryWatchingSvg /></span>}
        <WalletRecoveryInstructions
          instructionsText={(
            <span>
              {intl.formatMessage(messages.legacyExplanation)}
              <br />
              <br />
              {intl.formatMessage(messages.checkConfirm)}
            </span>
          )}
        />
      </Dialog>
    );
  }

}
