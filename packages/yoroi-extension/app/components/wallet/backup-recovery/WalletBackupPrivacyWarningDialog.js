// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import CheckboxLabel from '../../common/CheckboxLabel'
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import WalletRecoveryInstructions from './WalletRecoveryInstructions';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletBackupPrivacyWarningDialog.scss';
import { ReactComponent as RecoveryWatchingSvg }  from '../../../assets/images/recovery-watching.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  recoveryPhraseInstructions: {
    id: 'wallet.backup.privacy.warning.dialog.recoveryPhraseInstructions',
    defaultMessage: `!!!On the following screen, you will see a set of 15 random words. This is
    your wallet backup phrase. It can be entered in any version of Daedalus application in order
    to back up or restore your wallet’s funds and private key.`,
  },
  termNobodyWatching: {
    id: 'wallet.backup.privacy.warning.dialog.checkbox.label.nobodyWatching',
    defaultMessage: '!!!Make sure nobody looks into your screen unless you want them to have access to your funds.',
  }
});

type Props = {|
  +countdownRemaining: number,
  +canPhraseBeShown: boolean,
  +isPrivacyNoticeAccepted: boolean,
  +togglePrivacyNotice: void => void,
  +onContinue: void => void,
  +onCancelBackup: void => void,
|};

@observer
export default class WalletBackupPrivacyWarningDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      countdownRemaining,
      canPhraseBeShown,
      togglePrivacyNotice,
      onCancelBackup,
      isPrivacyNoticeAccepted,
      onContinue,
    } = this.props;
    const countdownDisplay = countdownRemaining > 0 ? ` (${countdownRemaining})` : '';
    const dialogClasses = classnames([
      styles.component,
      'WalletBackupPrivacyWarningDialog',
    ]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.continue) + countdownDisplay,
        onClick: onContinue,
        disabled: !canPhraseBeShown,
        primary: true
      }
    ];

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(globalMessages.recoveryPhraseDialogTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancelBackup}
        closeButton={<DialogCloseButton onClose={onCancelBackup} />}
      >
        <span className={styles.recoveryImage}><RecoveryWatchingSvg/></span>
        <WalletRecoveryInstructions
          instructionsText={<FormattedHTMLMessage {...messages.recoveryPhraseInstructions} />}
        />
        <div className={styles.checkbox}>
          <CheckboxLabel
            label={intl.formatMessage(messages.termNobodyWatching)}
            onChange={togglePrivacyNotice}
            checked={isPrivacyNoticeAccepted}
            labelSx={{ fontSize: '0.875rem' }}
            sx={{ marginTop: '20px' }}
          />
        </div>
      </Dialog>
    );
  }

}
