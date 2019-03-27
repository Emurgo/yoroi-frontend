// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import SvgInline from 'react-svg-inline';

import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';

import Dialog from '../../../widgets/Dialog';
import DialogBackButton from '../../../widgets/DialogBackButton';
import DialogCloseButton from '../../../widgets/DialogCloseButton';

import ProgressStepBlock from '../common/ProgressStepBlock';
import HelpLinkBlock from './HelpLinkBlock';
import HWErrorBlock from '../common/HWErrorBlock';

import connectLoadGIF from '../../../../assets/images/hardware-wallet/ledger/connect-load.gif';
import connectErrorSVG from '../../../../assets/images/hardware-wallet/ledger/connect-error.inline.svg';

import { ProgressInfo, StepState } from '../../../../types/HWConnectStoreTypes';

import { Logger } from '../../../../utils/logging';

import styles from '../common/ConnectDialog.scss';

const connectStartGIF = connectLoadGIF;

const messages = defineMessages({
  connectIntroTextLine1: {
    id: 'wallet.connect.ledger.dialog.step.connect.introText.line.1',
    defaultMessage: '!!!After connecting your Ledger device to your computer’s USB port, press the Connect button.',
  },
  connectIntroTextLine2: {
    id: 'wallet.connect.ledger.dialog.step.connect.introText.line.2',
    defaultMessage: '!!!Make sure Cardano ADA app is open on the Ledger device.',
  },
});

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
    const { progressInfo, isActionProcessing, error, goBack, submit, cancel } = this.props;

    const introBlock = (
      <div className={styles.headerBlock}>
        <span>{intl.formatMessage(messages.connectIntroTextLine1)}</span><br />
        <span>{intl.formatMessage(messages.connectIntroTextLine2)}</span><br />
        <span>{intl.formatMessage(globalMessages.hwConnectDialogConnectIntroTextLine3)}</span><br />
      </div>);

    let middleBlock = null;
    let backButton = null;

    switch (progressInfo.stepState) {
      case StepState.LOAD:
        backButton = (<DialogBackButton onBack={goBack} />);
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectLoadBlock])}>
            <img src={connectLoadGIF} alt="" />
          </div>);
        break;
      case StepState.PROCESS:
        backButton = null;
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectProcessBlock])}>
            <img src={connectStartGIF} alt="" />
          </div>);
        break;
      case StepState.ERROR:
        backButton = (<DialogBackButton onBack={goBack} />);
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectErrorBlock])}>
            <SvgInline svg={connectErrorSVG} />
          </div>);
        break;
      default:
        Logger.error('ledger::ConnectDialog::render: something unexpected happened');
        break;
    }

    const dailogActions = [{
      className: isActionProcessing ? styles.processing : null,
      label: intl.formatMessage(globalMessages.hwConnectDialogConnectButtonLabel),
      primary: true,
      disabled: isActionProcessing,
      onClick: submit
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'AboutDialog'])}
        title={intl.formatMessage(globalMessages.ledgerConnectAllDialogTitle)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        onClose={cancel}
        backButton={backButton}
        closeButton={<DialogCloseButton />}
      >
        <ProgressStepBlock progressInfo={progressInfo} />
        {introBlock}
        {middleBlock}
        <HelpLinkBlock progressInfo={progressInfo} />
        <HWErrorBlock progressInfo={progressInfo} error={error} />
      </Dialog>);
  }
}
