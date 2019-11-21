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

const messages = defineMessages({
  text: {
    id: 'yoroiTransfer.start.instructions.text',
    defaultMessage: '!!!Transfer funds from a <strong>non-Daedalus</strong> wallet (Yoroi, AdaLite, etc.). <br />More specifically, this will work for any wallet whose addresses start with Ae2',
  },
  mnemonicLabel15: {
    id: 'yoroiTransfer.start.instructions.mnemonic-15',
    defaultMessage: '!!!15-word mnemonic',
  },
  yoroiPaperLabel: {
    id: 'yoroiTransfer.start.instructions.yoroiPaper',
    defaultMessage: '!!!Yoroi paper wallet',
  },
});

type Props = {|
  +on15Words: void => void,
  +onPaper: void => void,
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
      on15Words,
      onPaper,
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
                  <FormattedHTMLMessage {...messages.text} />
                </div>
              </div>

              <div className={styles.operationBlock}>
                <div className={styles.buttonTitle}>
                  {intl.formatMessage(globalMessages.transferTitleText)}
                </div>
                <Button
                  className={`next standardMnemonic ${commonClasses}`}
                  label={intl.formatMessage(messages.mnemonicLabel15)}
                  onClick={on15Words}
                  skin={ButtonSkin}
                  disabled={disableTransferFunds}
                />
                <Button
                  className={`next yoroiPaper ${commonClasses}`}
                  label={intl.formatMessage(messages.yoroiPaperLabel)}
                  onClick={onPaper}
                  skin={ButtonSkin}
                  disabled={disableTransferFunds}
                />
              </div>

            </div>

          </BorderedBox>

        </div>
      </div>
    );
  }
}
