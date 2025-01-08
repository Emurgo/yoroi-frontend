// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import WalletRecoveryPhraseMnemonic from './WalletRecoveryPhraseMnemonic';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import DialogBackButton from '../../widgets/DialogBackButton';
import Dialog from '../../widgets/Dialog';
import WalletRecoveryInstructions from './WalletRecoveryInstructions';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletRecoveryPhraseDisplayDialog.scss';
import { ReactComponent as RecoveryPhraseSvg }  from '../../../assets/images/recovery-phrase.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  backupInstructions: {
    id: 'wallet.backup.recovery.phrase.display.dialog.backup.instructions',
    defaultMessage: `!!!Please, make sure you have carefully written down your recovery phrase somewhere safe.
    You will need this phrase later for next use and recover. Phrase is case sensitive.`,
  },
  buttonLabelIHaveWrittenItDown: {
    id: 'wallet.backup.recovery.phrase.display.dialog.button.label.iHaveWrittenItDown',
    defaultMessage: '!!!Yes, I’ve written it down',
  }
});

type Props = {|
  +recoveryPhrase: string,
  +onStartWalletBackup: void => void,
  +onCancelBackup: void => void,
  +onBack: void => void,
|};

@observer
export default class WalletRecoveryPhraseDisplayDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      recoveryPhrase,
      onStartWalletBackup,
      onCancelBackup,
      onBack,
    } = this.props;

    const actions = [
      {
        label: intl.formatMessage(messages.buttonLabelIHaveWrittenItDown),
        onClick: onStartWalletBackup,
        primary: true
      }
    ];

    return (
      <Dialog
        className="WalletRecoveryPhraseDisplayDialog"
        title={intl.formatMessage(globalMessages.recoveryPhraseDialogTitle)}
        dialogActions={actions}
        onClose={onCancelBackup}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton onClose={onCancelBackup} />}
        backButton={<DialogBackButton onBack={onBack} />}
      >
        <span className={styles.recoveryImage}><RecoveryPhraseSvg/></span>

        <WalletRecoveryInstructions
          instructionsText={<FormattedHTMLMessage {...messages.backupInstructions} />}
        />
        <WalletRecoveryPhraseMnemonic phrase={recoveryPhrase} />
      </Dialog>
    );
  }

}
