// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import WalletRecoveryPhraseMnemonic from './WalletRecoveryPhraseMnemonic';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import DialogBackButton from '../../widgets/DialogBackButton';
import Dialog from '../../widgets/Dialog';
import WalletRecoveryInstructions from './WalletRecoveryInstructions';
import MnemonicWord from './MnemonicWord';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletRecoveryPhraseEntryDialog.scss';

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
    defaultMessage: '!!!I understand that my money are held securely on this device only, not on the company servers',
  },
  termRecovery: {
    id: 'wallet.backup.recovery.phrase.entry.dialog.terms.and.condition.recovery',
    defaultMessage: `!!!I understand that if this application is moved to another device or deleted, my money can
    be only recovered with the backup phrase which were written down in a secure place`,
  }
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
  +onAddWord: {| index: number, word: string |} => void,
  +onClear: void => void,
  +onAcceptTermDevice: void => void,
  +onAcceptTermRecovery: void => void,
  +onRestartBackup: void => void,
  +onCancelBackup: void => void,
  +onFinishBackup: void => PossiblyAsync<void>,
  +removeWord: void => void,
  +hasWord: boolean,
  +classicTheme: boolean,
|};

@observer
export default class WalletRecoveryPhraseEntryDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
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
      classicTheme,
    } = this.props;
    const dialogClasses = classnames([
      styles.component,
      'WalletRecoveryPhraseEntryDialog',
    ]);

    const enteredPhraseString = enteredPhrase.reduce((phrase, { word }) => `${phrase} ${word}`, '');

    const actions = [];

    // Only show "Clear" button when user is not yet done with entering mnemonic
    if (!isValid) {
      actions.unshift({
        label: intl.formatMessage(messages.buttonLabelRemoveLast),
        onClick: removeWord,
        disabled: !hasWord,
        primary: true
      });
      actions.unshift({
        label: intl.formatMessage(messages.buttonLabelClear),
        onClick: onClear,
        disabled: !hasWord,
        primary: true
      });
    } else {
      actions.push({
        className: isSubmitting ? styles.isSubmitting : null,
        label: intl.formatMessage(messages.buttonLabelConfirm),
        onClick: onFinishBackup,
        disabled: isSubmitting || !isTermDeviceAccepted || !isTermRecoveryAccepted,
        primary: true
      });
    }

    const phraseOld = enteredPhraseString;
    const phrase = enteredPhrase.length ? (
      <div className={styles.phraseWrapper}>
        {enteredPhrase.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={item.word + i} className={styles.phraseWord}>{item.word}</div>
        ))}
      </div>
    ) : (
      <p className={styles.phrasePlaceholder}>
        {intl.formatMessage(messages.verificationInstructions)}
      </p>
    );

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(globalMessages.recoveryPhraseDialogTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancelBackup}
        closeButton={<DialogCloseButton onClose={onCancelBackup} />}
        backButton={!isValid ? <DialogBackButton onBack={onRestartBackup} /> : null}
        classicTheme={classicTheme}
      >
        {!isValid && classicTheme ? (
          <WalletRecoveryInstructions
            instructionsText={intl.formatMessage(messages.verificationInstructions)}
          />
        ) : null}

        {!isValid && <WalletRecoveryPhraseMnemonic
          filled={!classicTheme && Boolean(enteredPhrase.length)}
          phrase={classicTheme ? phraseOld : phrase}
          classicTheme={classicTheme}
        />}

        {!isValid && (
          <div className={styles.words}>
            {recoveryPhraseSorted.map(({ word, isActive }, index) => (
              <MnemonicWord
                key={word + index} // eslint-disable-line react/no-array-index-key
                word={word}
                index={index}
                isActive={isActive}
                onClick={(value) => {
                  if (isActive) {
                    onAddWord(value);
                  }
                }}
                classicTheme={classicTheme}
              />
            ))}
          </div>
        )}

        {isValid && (
          <div>
            <div className={styles.checkbox}>
              <Checkbox
                label={<FormattedHTMLMessage {...messages.termDevice} />}
                onChange={onAcceptTermDevice}
                checked={isTermDeviceAccepted}
                skin={CheckboxSkin}
              />
            </div>
            <div className={styles.checkbox}>
              <Checkbox
                label={intl.formatMessage(messages.termRecovery)}
                onChange={onAcceptTermRecovery}
                checked={isTermRecoveryAccepted}
                skin={CheckboxSkin}
              />
            </div>
          </div>
        )}
      </Dialog>
    );
  }

}
