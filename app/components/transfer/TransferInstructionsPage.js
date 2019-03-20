// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import BorderedBox from '../widgets/BorderedBox';
import globalMessages from '../../i18n/global-messages';
import styles from './TransferInstructionsPage.scss';

const messages = defineMessages({
  instructionsText: {
    id: 'transfer.instructions.instructions.text',
    defaultMessage: '!!!Before you can transfer funds, you must create a Yoroi wallet and back it up. Upon completion, you will receive a 15-word recovery phrase which can be used to restore your Yoroi wallet at any time.',
  },
  instructionsButton: {
    id: 'transfer.instructions.instructions.button.label',
    defaultMessage: '!!!Create Yoroi wallet',
  },
  attentionTitle: {
    id: 'transfer.instructions.attention.title.label',
    defaultMessage: '!!!Attention',
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;
messages.instructionTitle = globalMessages.instructionTitle;

type Props = {
  onFollowInstructionsPrerequisites: Function,
  onConfirm: Function,
  onPaperConfirm: Function,
  onMasterKeyConfirm: Function,
  disableTransferFunds: boolean,
  attentionText: string,
  confirmationText: string,
  confirmationPaperText: string,
  confirmationMasterKeyText: string,
};

@observer
export default class TransferInstructionsPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      onFollowInstructionsPrerequisites,
      onConfirm,
      onPaperConfirm,
      onMasterKeyConfirm,
      disableTransferFunds,
      attentionText,
      confirmationText,
      confirmationPaperText,
      confirmationMasterKeyText,
    } = this.props;

    const instructionsButtonClasses = classnames([
      'instructionsButton',
      'primary',
      styles.button,
    ]);

    const confirmButtonClasses = classnames([
      'confirmButton',
      'primary',
      styles.button,
    ]);

    return (
      <div className="transferInstructionsPageComponent">

        { /* Ask user to create a Yoroi wallet if they don't have one yet */ }
        <div className={styles.component}>
          <BorderedBox>

            <div className={styles.body}>

              <div>
                <div className={styles.title}>
                  {intl.formatMessage(messages.instructionTitle)}
                </div>
                <div className={styles.text}>
                  {intl.formatMessage(messages.instructionsText)}
                </div>
              </div>

              <Button
                className={instructionsButtonClasses}
                label={intl.formatMessage(messages.instructionsButton)}
                onClick={onFollowInstructionsPrerequisites}
                disabled={!disableTransferFunds}
                skin={ButtonSkin}
              />

            </div>

          </BorderedBox>

        </div>

        { /* Confirm transferring funds */ }
        <div className={styles.component}>
          <BorderedBox>

            <div className={styles.body}>

              <div>
                <div className={styles.title}>
                  {intl.formatMessage(messages.attentionTitle)}
                </div>
                <div className={styles.text}>
                  {attentionText}
                </div>
              </div>

              <Button
                className={confirmButtonClasses}
                label={confirmationText}
                onClick={onConfirm}
                disabled={disableTransferFunds}
                skin={ButtonSkin}
              />

              <Button
                className={confirmButtonClasses}
                label={confirmationPaperText}
                onClick={onPaperConfirm}
                disabled={disableTransferFunds}
                skin={ButtonSkin}
              />

              <Button
                className={`masterKey ${confirmButtonClasses}`} // append class for testing
                label={confirmationMasterKeyText}
                onClick={onMasterKeyConfirm}
                disabled={disableTransferFunds}
                skin={ButtonSkin}
              />

            </div>

          </BorderedBox>

        </div>

      </div>
    );
  }
}
