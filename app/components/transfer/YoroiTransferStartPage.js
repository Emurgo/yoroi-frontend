// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

import BorderedBox from '../widgets/BorderedBox';
import styles from './YoroiTransferStartPage.scss';
import globalMessages from '../../i18n/global-messages';
import environment from '../../environment';

const messages = defineMessages({
  text: {
    id: 'yoroiTransfer.start.instructions.text',
    defaultMessage: '!!!Transfer funds from a <strong>non-Daedalus</strong> wallet (Yoroi, AdaLite, etc.). <br />More specifically, this will work for any wallet whose addresses start with Ae2',
  },
  mnemonicLabel15: {
    id: 'yoroiTransfer.start.instructions.mnemonic-15',
    defaultMessage: '!!!15-word recovery phrase',
  },
  hardwareLabel: {
    id: 'yoroiTransfer.start.instructions.hardware',
    defaultMessage: '!!!Hardware wallet',
  },
  yoroiPaperLabel: {
    id: 'yoroiTransfer.start.instructions.yoroiPaper',
    defaultMessage: '!!!Yoroi paper wallet',
  },
  legacyMnemonicLabel15: {
    id: 'yoroiTransfer.start.instructions.mnemonic-legacy-15',
    defaultMessage: '!!!Legacy 15-word recovery phrase',
  },
  legacyYoroiPaperLabel: {
    id: 'yoroiTransfer.start.instructions.legacy-yoroiPaper',
    defaultMessage: '!!!Legacy Yoroi paper wallet',
  },
  legacyLedgerTitle: {
    id: 'yoroiTransfer.start.instructions.legacy-ledger',
    defaultMessage: '!!!Legacy Ledger Hardware Wallet',
  },
  legacyTrezorTitle: {
    id: 'yoroiTransfer.start.instructions.legacy-trezor',
    defaultMessage: '!!!Legacy Trezor Hardware Wallet',
  },
});

type Props = {|
  +onLegacy15Words: void => void,
  +onLegacyPaper: void => void,
  +onShelley15Words: void => void,
  +onLegacyTrezor: void => void,
  +onLegacyLedger: void => void,
  +classicTheme: boolean,
  +onFollowInstructionsPrerequisites: void => void,
  +disableTransferFunds: boolean,
|};

@observer
export default class YoroiTransferStartPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      onFollowInstructionsPrerequisites,
      disableTransferFunds,
    } = this.props;

    const commonClasses = classnames([
      'primary',
      styles.button,
    ]);

    return (
      <div className="yoroiTransferStartPageComponent">

        { /* Ask user to create a Yoroi wallet if they don't have one yet */ }
        <div className={styles.component}>
          <BorderedBox>

            <div className={styles.body}>

              <div className={styles.infoBlock}>
                <div className={styles.title}>
                  {intl.formatMessage(globalMessages.instructionTitle)}
                </div>
                <div className={styles.text}>
                  <FormattedHTMLMessage {...globalMessages.transferInstructionsText} />
                </div>
              </div>

              <div className={styles.operationBlock}>
                <div className={styles.title}>
                  &nbsp;{/* pretend we have a title to get the button alignment correct */}
                </div>
                <Button
                  className={`createYoroiWallet ${commonClasses}`}
                  label={intl.formatMessage(globalMessages.transferInstructionsButton)}
                  onClick={onFollowInstructionsPrerequisites}
                  disabled={!disableTransferFunds}
                  skin={ButtonSkin}
                />
              </div>

            </div>

          </BorderedBox>

        </div>

        <div className={styles.component}>
          <BorderedBox>

            <div className={styles.body}>

              <div className={styles.infoBlock}>
                <div className={styles.title}>
                  {intl.formatMessage(globalMessages.attentionTitle)}
                </div>
                <div className={styles.text}>
                  <FormattedHTMLMessage {...(environment.isShelley()
                    ? globalMessages.legacyAttentionText
                    : messages.text)
                  }
                  />
                </div>
              </div>

              <div className={styles.operationBlock}>
                <div className={styles.buttonTitle}>
                  {intl.formatMessage(globalMessages.transferTitleText)}
                </div>
                <Button
                  className={`next standardMnemonic ${commonClasses}`}
                  label={intl.formatMessage(messages.legacyMnemonicLabel15)}
                  onClick={this.props.onLegacy15Words}
                  skin={ButtonSkin}
                  disabled={disableTransferFunds}
                />
                <Button
                  className={`next yoroiPaper ${commonClasses}`}
                  label={intl.formatMessage(messages.legacyYoroiPaperLabel)}
                  onClick={this.props.onLegacyPaper}
                  skin={ButtonSkin}
                  disabled={disableTransferFunds}
                />
                {environment.isShelley()
                  ? (
                    <>
                      <Button
                        className={`next trezorHardwareMnemonic ${commonClasses}`}
                        label={intl.formatMessage(messages.legacyLedgerTitle)}
                        onClick={this.props.onLegacyLedger}
                        skin={ButtonSkin}
                        disabled={disableTransferFunds}
                      />
                      <Button
                        className={`next ledgerHardwareMnemonic ${commonClasses}`}
                        label={intl.formatMessage(messages.legacyTrezorTitle)}
                        onClick={this.props.onLegacyTrezor}
                        skin={ButtonSkin}
                        disabled={disableTransferFunds}
                      />
                    </>
                  )
                  : null
                }
                {environment.isShelley()
                  ? (
                    <>
                      <Button
                        className={`next standardShelleyMnemonic ${commonClasses}`}
                        label={intl.formatMessage(messages.mnemonicLabel15)}
                        onClick={this.props.onShelley15Words}
                        skin={ButtonSkin}
                        disabled={disableTransferFunds}
                      />
                    </>)
                  : null
                }
                {environment.isShelley() && environment.isDev()
                  ? (
                    <>
                      <Button
                        className={`next yoroiShelleyPaper ${commonClasses}`}
                        label={intl.formatMessage(messages.yoroiPaperLabel)}
                        onClick={this.props.onLegacyPaper} // TODO: not implemented yet
                        skin={ButtonSkin}
                        disabled={disableTransferFunds}
                      />
                    </>)
                  : null
                }
              </div>

            </div>

          </BorderedBox>

        </div>
      </div>
    );
  }
}
