// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import SvgInline from 'react-svg-inline';

import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';

import Dialog from '../../widgets/Dialog';
import DialogBackButton from '../../widgets/DialogBackButton';
import DialogCloseButton from '../../widgets/DialogCloseButton';

import ProgressStepBlock from './common/ProgressStepBlock';
import HelpLinkBlock from './common/HelpLinkBlock';
import ErrorBlock from './common/ErrorBlock';

import connectLoadGIF from '../../../assets/images/trezor/connect-load.gif';
import connectStartGIF from '../../../assets/images/trezor/connect-start.gif';
import connectErrorSVG from '../../../assets/images/trezor/connect-error.inline.svg';

import type { ProgressInfo } from '../../../stores/ada/TrezorConnectStore';
import { StepStateOption } from '../../../stores/ada/TrezorConnectStore';

import styles from './ConnectDialog.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor Hardware Wallet',
    description: 'Label "Connect to Trezor Hardware Wallet" on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectIntroTextLine1: {
    id: 'wallet.trezor.dialog.trezor.step.connect.introText.line.1',
    defaultMessage: '!!!After connecting your Trezor device to the computer press the Connect button.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectIntroTextLine2: {
    id: 'wallet.trezor.dialog.trezor.step.connect.introText.line.2',
    defaultMessage: '!!!A new tab will appear, please follow the instructions in the new tab.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectIntroTextLine3: {
    id: 'wallet.trezor.dialog.trezor.step.connect.introText.line.3',
    defaultMessage: '!!!This process shares the Cardano public key with Yoroi.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.connect.button.label',
    defaultMessage: '!!!Connect',
    description: 'Label for the "Connect" button on the Connect to Trezor Hardware Wallet dialog.'
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  progressInfo: ProgressInfo,
  isActionProcessing: boolean,
  error: ?LocalizableError,
  goBack: Function,
  submit: Function,
  cancel: Function,
};

@observer
export default class ConnectDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;

    // introBlock
    const introBlock = (
      <div className={styles.headerBlock}>
        <span>{intl.formatMessage(messages.connectIntroTextLine1)}</span><br />
        <span>{intl.formatMessage(messages.connectIntroTextLine2)}</span><br />
        <span>{intl.formatMessage(messages.connectIntroTextLine3)}</span><br />
      </div>);

    // middleBlock + backButton selection depending upon state
    let middleBlock = null;
    let backButton = null;

    switch (this.props.progressInfo.stepState) {
      case StepStateOption.LOAD:
        backButton = (<DialogBackButton onBack={this.props.goBack} />);
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectLoadBlock])}>
            <img src={connectLoadGIF} alt="" />
          </div>);
        break;
      case StepStateOption.PROCESS:
        backButton = null;
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectProcessBlock])}>
            <img src={connectStartGIF} alt="" />
          </div>);
        break;
      case StepStateOption.ERROR:
        backButton = (<DialogBackButton onBack={this.props.goBack} />);
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectErrorBlock])}>
            <SvgInline svg={connectErrorSVG} cleanup={['title']} />
          </div>);
        break;
      default:
        console.error('Error : something unexpected happened');
        break;
    }

    const dailogActions = [{
      className: this.props.isActionProcessing ? styles.processing : null,
      label: intl.formatMessage(messages.connectButtonLabel),
      primary: true,
      disabled: this.props.isActionProcessing,
      onClick: this.props.submit
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'AboutDialog'])}
        title={intl.formatMessage(messages.title)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        onClose={this.props.cancel}
        backButton={backButton}
        closeButton={<DialogCloseButton />}
      >
        <ProgressStepBlock progressInfo={this.props.progressInfo} />
        {introBlock}
        {middleBlock}
        <HelpLinkBlock progressInfo={this.props.progressInfo} />
        <ErrorBlock progressInfo={this.props.progressInfo} error={this.props.error} />
      </Dialog>);
  }
}
