// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import CheckboxLabel from '../../common/CheckboxLabel';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import WalletRecoveryPhraseMnemonic from './WalletRecoveryPhraseMnemonic';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import DialogBackButton from '../../widgets/DialogBackButton';
import Dialog from '../../widgets/Dialog';
import MnemonicWord from './MnemonicWord';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletRecoveryPhraseEntryDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  verificationInstructions: {
    id: 'wallet.backup.recovery.phrase.entry.dialog.verification.instructions',
    defaultMessage: '!!!Tap each word in the correct order to verify your recovery phrase',
  },
  buttonLabelRemoveLast: {
    id: 'wallet.recovery.phrase.show.entry.dialog.button.labelRemoveLast',
    defaultMessage: '!!!Remove last',
  },
  buttonLabelConfirm: {
    id: 'wallet.recovery.phrase.show.entry.dialog.button.labelConfirm',
    defaultMessage: '!!!Confirm',
  },
  buttonLabelClear: {
    id: 'wallet.recovery.phrase.show.entry.dialog.button.labelClear',
    defaultMessage: '!!!Clear',
  },
  termDevice: {
    id: 'wallet.backup.recovery.phrase.entry.dialog.terms.and.condition.device',
    defaultMessage:
      '!!!I understand that my money are held securely on this device only, not on the company servers',
  },
  termRecovery: {
    id: 'wallet.backup.recovery.phrase.entry.dialog.terms.and.condition.recovery',
    defaultMessage: `!!!I understand that if this application is moved to another device or deleted, my money can
    be only recovered with the backup phrase which were written down in a secure place`,
  },
  phraseDoesNotMatch: {
    id: 'wallet.backup.recovery.phrase.entry.dialog.error.phraseDoesNotMatch',
    defaultMessage: '!!!Recovery phrase does not match.',
  },
});

type Props = {|
  +recoveryPhraseSorted: Array<{|
    word: string,
    isActive: boolean,
  |}>,
  +enteredPhrase: Array<{|
    word: string,
    index: number,
  |}>,
  +isValid: boolean,
  +isTermDeviceAccepted: boolean,
  +isTermRecoveryAccepted: boolean,
  +isSubmitting: boolean,
  +onAddWord: ({| index: number, word: string |}) => void,
  +onClear: void => void,
  +onAcceptTermDevice: void => void,
  +onAcceptTermRecovery: void => void,
  +onRestartBackup: void => void,
  +onCancelBackup: void => void,
  +onFinishBackup: void => PossiblyAsync<void>,
  +removeWord: void => void,
  +hasWord: boolean,
|};

@observer
export default class WalletRecoveryPhraseEntryDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      recoveryPhraseSorted,
      enteredPhrase,
      isValid,
      isTermDeviceAccepted,
      isTermRecoveryAccepted,
      isSubmitting,
      onAddWord,
      onClear,
      onAcceptTermDevice,
      onAcceptTermRecovery,
      removeWord,
      onRestartBackup,
      onCancelBackup,
      onFinishBackup,
      hasWord,
    } = this.props;
    const dialogClasses = classnames([styles.component, 'WalletRecoveryPhraseEntryDialog']);

    const actions = [];

    // Only show "Clear" button when user is not yet done with entering mnemonic
    if (!isValid) {
      actions.unshift({
        label: intl.formatMessage(messages.buttonLabelRemoveLast),
        onClick: removeWord,
        disabled: !hasWord,
        primary: true,
      });
      actions.unshift({
        label: intl.formatMessage(messages.buttonLabelClear),
        onClick: onClear,
        disabled: !hasWord,
        primary: true,
      });
    } else {
      actions.push({
        className: isSubmitting ? styles.isSubmitting : null,
        label: intl.formatMessage(messages.buttonLabelConfirm),
        onClick: onFinishBackup,
        disabled: isSubmitting || !isTermDeviceAccepted || !isTermRecoveryAccepted,
        primary: true,
      });
    }

    const phrase = enteredPhrase.length ? (
      <div className={styles.phraseWrapper}>
        {enteredPhrase.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={item.word + i} className={styles.phraseWord}>
            {item.word}
          </div>
        ))}
      </div>
    ) : (
      <div className={styles.phrasePlaceholder}>
        {intl.formatMessage(messages.verificationInstructions)}
      </div>
    );

    const phraseDoesNotMatchError =
      !isValid && enteredPhrase.length === recoveryPhraseSorted.length
        ? intl.formatMessage(messages.phraseDoesNotMatch)
        : '';

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(globalMessages.recoveryPhraseDialogTitle)}
        dialogActions={actions}
        closeOnOverlayClick={false}
        onClose={onCancelBackup}
        closeButton={<DialogCloseButton onClose={onCancelBackup} />}
        backButton={!isValid ? <DialogBackButton onBack={onRestartBackup} /> : null}
      >
        {!isValid && (
          <WalletRecoveryPhraseMnemonic
            filled={Boolean(enteredPhrase.length)}
            phrase={phrase}
            phraseDoesNotMatch={phraseDoesNotMatchError}
          />
        )}

        {!isValid && (
          <div className={styles.words}>
            {recoveryPhraseSorted.map(({ word, isActive }, index) =>
              isActive ? (
                <MnemonicWord
                  key={word + index} // eslint-disable-line react/no-array-index-key
                  word={word}
                  index={index}
                  isActive={isActive}
                  onClick={value => {
                    if (isActive) {
                      onAddWord(value);
                    }
                  }}
                />
              ) : null
            )}
          </div>
        )}

        {isValid && (
          <div>
            <div className={styles.checkbox}>
              <CheckboxLabel
                label={<FormattedHTMLMessage {...messages.termDevice} />}
                onChange={onAcceptTermDevice}
                checked={isTermDeviceAccepted}
                labelProps={{
                  sx: {
                    fontSize: '0.875rem',
                  },
                }}
              />
            </div>
            <div className={styles.checkbox}>
              <CheckboxLabel
                label={intl.formatMessage(messages.termRecovery)}
                onChange={onAcceptTermRecovery}
                labelProps={{
                  sx: {
                    fontSize: '0.875rem',
                  },
                }}
                checked={isTermRecoveryAccepted}
              />
            </div>
          </div>
        )}
      </Dialog>
    );
  }
}
