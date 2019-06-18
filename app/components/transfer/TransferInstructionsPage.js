// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';

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
  attentionText: {
    id: 'daedalusTransfer.instructions.attention.text',
    defaultMessage: '!!!Yoroi and Daedalus wallets use different key derivation scheme and they each have a separate format for addresses. For this reason, Daedalus wallets cannot be restored and continued to be used in Yoroi and vice versa. This will change in the future. For now, to use funds from your Daedalus wallet, you need to transfer them to your Yoroi wallet. Daedalus and Yoroi wallets are fully compatible for transferring of funds. If you don’t have a working copy of Daedalus, you can use your 12-word recovery phrase (or 27-words for a paper wallet) used to restore and transfer the balance from Daedalus into Yoroi.',
  },
  transferTitleText: {
    id: 'daedalusTransfer.instructions.attention.title',
    defaultMessage: '!!!Transfer all funds from'
  },
  transferText: {
    id: 'daedalusTransfer.instructions.attention.button.label',
    defaultMessage: '!!!Daedalus Wallet',
  },
  transferPaperText: {
    id: 'daedalusTransfer.instructions.attention.paper.button.label',
    defaultMessage: '!!!Daedalus Paper Wallet',
  },
  transferMasterKeyText: {
    id: 'daedalusTransfer.instructions.attention.masterKey.button.label',
    defaultMessage: '!!!Daedalus Master Key',
  },
});

type Props = {|
  onFollowInstructionsPrerequisites: Function,
  onConfirm: Function,
  onPaperConfirm: Function,
  onMasterKeyConfirm: Function,
  disableTransferFunds: boolean,
|};

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
    } = this.props;

    const commonClasses = classnames([
      'primary',
      styles.button,
    ]);

    return (
      <div className="transferInstructionsPageComponent">

        { /* Ask user to create a Yoroi wallet if they don't have one yet */ }
        <div className={styles.component}>
          <BorderedBox>

            <div className={styles.body}>

              <div className={styles.infoBlock}>
                <div className={styles.title}>
                  {intl.formatMessage(globalMessages.instructionTitle)}
                </div>
                <div className={styles.text}>
                  <FormattedHTMLMessage {...messages.instructionsText} />
                </div>
              </div>

              <div className={styles.operationBlock}>
                <div className={styles.title}>
                  &nbsp;{/* pretend we have a title to get the button alignment correct */}
                </div>
                <Button
                  className={`createYoroiWallet ${commonClasses}`}
                  label={intl.formatMessage(messages.instructionsButton)}
                  onClick={onFollowInstructionsPrerequisites}
                  disabled={!disableTransferFunds}
                  skin={ButtonSkin}
                />
              </div>

            </div>

          </BorderedBox>

        </div>

        { /* Confirm transferring funds */ }
        <div className={styles.component}>
          <BorderedBox>

            <div className={styles.body}>

              <div className={styles.infoBlock}>
                <div className={styles.title}>
                  {intl.formatMessage(messages.attentionTitle)}
                </div>
                <div className={styles.text}>
                  <FormattedHTMLMessage {...messages.attentionText} />
                </div>
              </div>

              <div className={styles.operationBlock}>
                <div className={styles.buttonTitle}>
                  {intl.formatMessage(messages.transferTitleText)}
                </div>

                <Button
                  className={`confirmButton fromDaedalusWallet ${commonClasses}`}
                  label={intl.formatMessage(messages.transferText)}
                  onClick={onConfirm}
                  disabled={disableTransferFunds}
                  skin={ButtonSkin}
                />

                <Button
                  className={`confirmButton fromDaedalusPaperWallet ${commonClasses}`}
                  label={intl.formatMessage(messages.transferPaperText)}
                  onClick={onPaperConfirm}
                  disabled={disableTransferFunds}
                  skin={ButtonSkin}
                />

                <Button
                  className={`confirmButton fromDaedalusMasterKey ${commonClasses}`}
                  label={intl.formatMessage(messages.transferMasterKeyText)}
                  onClick={onMasterKeyConfirm}
                  disabled={disableTransferFunds}
                  skin={ButtonSkin}
                />
              </div>

            </div>

          </BorderedBox>

        </div>

      </div>
    );
  }
}
