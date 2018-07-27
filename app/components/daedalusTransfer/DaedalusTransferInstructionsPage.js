// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import BorderedBox from '../widgets/BorderedBox';
import globalMessages from '../../i18n/global-messages';
import styles from './DaedalusTransferInstructionsPage.scss';

const messages = defineMessages({
  instructionTitle: {
    id: 'daedalusTransfer.instructions.instructions.title.label',
    defaultMessage: '!!!Instructions',
    description: 'Label "Instructions" on the Daedalus transfer instructions page.'
  },
  instructionsText: {
    id: 'daedalusTransfer.instructions.instructions.text',
    defaultMessage: '!!!Before you can transfer funds from your Daedalus wallet, you must create an Icarus wallet and back it up. Upon completion, you will receive a 15-word recovery phrase which can be used to restore your Icarus wallet at any time.',
    description: 'Instructions text on the Daedalus transfer instructions page.'
  },
  instructionsButton: {
    id: 'daedalusTransfer.instructions.instructions.button.label',
    defaultMessage: '!!!Create Icarus wallet',
    description: 'Label "Create Icarus wallet" on the Daedalus transfer instructions page.'
  },
  attentionTitle: {
    id: 'daedalusTransfer.instructions.attention.title.label',
    defaultMessage: '!!!Attention',
    description: 'Label "Attention" on the Daedalus transfer instructions page.'
  },
  attentionText: {
    id: 'daedalusTransfer.instructions.attention.text',
    defaultMessage: '!!!Icarus and Daedalus wallets use different key derivation scheme and they each have a separate format for addresses. For this reason, Daedalus wallets cannot be restored and continued to be used in Icarus and vice versa. This will change in the future. For now, to use funds from your Daedalus wallet, you need to transfer them to your Icarus wallet. Daedalus and Icarus wallets are fully compatible for transferring of funds. If you don’t have a working copy of Daedalus, you can use your 12-word recovery phrase used to restore and transfer the balance from Daedalus into Icarus.',
    description: 'Attention text on the Daedalus transfer instructions page.'
  },
  question: {
    id: 'daedalusTransfer.instructions.attention.question.label',
    defaultMessage: '!!!Do you have access to a working copy of your Daedalus wallet?',
    description: 'Label "Do you have access to a working copy of your Daedalus wallet?" on the Daedalus transfer instructions page.'
  },
  answerYes: {
    id: 'daedalusTransfer.instructions.attention.answer.yes.label',
    defaultMessage: '!!!Yes',
    description: 'Label "Yes" on the Daedalus transfer instructions page.'
  },
  answerYesText: {
    id: 'daedalusTransfer.instructions.attention.answer.yes.text',
    defaultMessage: '!!!Use the <receive screen> to generate a new address and use it to send funds from Daedalus.',
    description: 'text related to answer "Yes" on the Daedalus transfer instructions page.'
  },
  answerYesButton: {
    id: 'daedalusTransfer.instructions.instructions.attention.answer.yes.button.label',
    defaultMessage: '!!!Go to the Receive screen',
    description: 'Label "Go to the Receive screen" on the Daedalus transfer instructions page.'
  },
  answerNo: {
    id: 'daedalusTransfer.instructions.attention.answer.no.label',
    defaultMessage: '!!!No',
    description: 'Label "No" on the Daedalus transfer instructions page.'
  },
  answerNoText: {
    id: 'daedalusTransfer.instruction.attention.answer.no.text',
    defaultMessage: '!!!Use the 12-word recovery phrase to transfer all of the funds from your Daedalus wallet to Icarus.',
    description: 'Label related to answer "No" on the Daedalus transfer instructions page.'
  },
  answerNoButton: {
    id: 'daedalusTransfer.instructions.attention.answer.no.button.label',
    defaultMessage: '!!!Transfer all funds from Daedalus wallet',
    description: 'Label "Transfer all funds from Daedalus wallet" on the Daedalus transfer instructions page.'
  }
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onFollowInstructionsPrerequisites: Function,
  onAnswerYes: Function,
  onAnswerNo: Function,
  disableTransferFunds: boolean,
};

@observer
export default class DaedalusTransferInstructionsPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      onFollowInstructionsPrerequisites,
      onAnswerYes,
      onAnswerNo,
      disableTransferFunds,
    } = this.props;

    const instructionsButtonClasses = classnames([
      'instructionsButton',
      'primary',
      styles.button,
    ]);

    const answerYesButtonClasses = classnames([
      'answerYesButton',
      'primary',
      styles.button,
    ]);

    const answerNoButtonClasses = classnames([
      'answerNoButton',
      'primary',
      styles.button,
    ]);

    return (
      <div>

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
                skin={<SimpleButtonSkin />}
              />

            </div>

          </BorderedBox>

        </div>

        <div className={styles.component}>
          <BorderedBox>

            <div className={styles.body}>

              <div>
                <div className={styles.title}>
                  {intl.formatMessage(messages.attentionTitle)}
                </div>
                <div className={styles.text}>
                  {intl.formatMessage(messages.attentionText)}
                </div>
              </div>

              <div className={styles.questionLabel}>
                {intl.formatMessage(messages.question)}
              </div>

              <div className={styles.tableWrapper}>

                <div className={styles.columnWrapper}>
                  <div className={styles.answerLabel}>
                    {intl.formatMessage(messages.answerYes)}
                  </div>
                  <div className={styles.answerText}>
                    {intl.formatMessage(messages.answerYesText)}
                  </div>
                  <Button
                    className={answerYesButtonClasses}
                    label={intl.formatMessage(messages.answerYesButton)}
                    onClick={onAnswerYes}
                    disabled={disableTransferFunds}
                    skin={<SimpleButtonSkin />}
                  />
                </div>

                <div className={styles.columnWrapper}>
                  <div className={styles.answerLabel}>
                    {intl.formatMessage(messages.answerNo)}
                  </div>
                  <div className={styles.answerText}>
                    {intl.formatMessage(messages.answerNoText)}
                  </div>
                  <Button
                    className={answerNoButtonClasses}
                    label={intl.formatMessage(messages.answerNoButton)}
                    onClick={onAnswerNo}
                    disabled={disableTransferFunds}
                    skin={<SimpleButtonSkin />}
                  />
                </div>

              </div>

            </div>

          </BorderedBox>

        </div>

      </div>
    );
  }
}
