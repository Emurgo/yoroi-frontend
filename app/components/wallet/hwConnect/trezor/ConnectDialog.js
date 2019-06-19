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

import connectLoadImage from '../../../../assets/images/hardware-wallet/trezor/connect-load-modern.inline.gif';
import connectErrorImage from '../../../../assets/images/hardware-wallet/trezor/connect-error-modern.inline.svg';

import connectLoadGIF from '../../../../assets/images/hardware-wallet/trezor/connect-load.gif';
import connectErrorSVG from '../../../../assets/images/hardware-wallet/trezor/connect-error.inline.svg';

import { ProgressInfo, StepState } from '../../../../types/HWConnectStoreTypes';

import { Logger } from '../../../../utils/logging';

import styles from '../common/ConnectDialog.scss';
import headerMixin from '../../../mixins/HeaderBlock.scss';

const connectStartGIF = connectLoadGIF;

const messages = defineMessages({
  connectIntroTextLine1: {
    id: 'wallet.connect.trezor.dialog.step.connect.introText.line.1',
    defaultMessage: '!!!After connecting your Trezor device to the computer press the Connect button.',
  },
  connectIntroTextLine2: {
    id: 'wallet.connect.trezor.dialog.step.connect.introText.line.2',
    defaultMessage: '!!!A new tab will appear, please follow the instructions in the new tab.',
  },
});

type Props = {|
  progressInfo: ProgressInfo,
  isActionProcessing: boolean,
  error: ?LocalizableError,
  goBack: Function,
  submit: Function,
  cancel: Function,
  classicTheme: boolean
|};

@observer
export default class ConnectDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      progressInfo,
      isActionProcessing,
      error,
      goBack,
      submit,
      cancel,
      classicTheme
    } = this.props;
    const headerBlockClasses = classicTheme
      ? classnames([headerMixin.headerBlockClassic, styles.headerBlockClassic])
      : classnames([headerMixin.headerBlock, styles.headerBlock]);
    const middleBlockClasses = classicTheme ? styles.middleBlockClassic : styles.middleBlock;
    const middleConnectErrorBlockClasses = classicTheme
      ? styles.middleConnectErrorBlockClassic
      : null;

    const introBlock = classicTheme ? (
      <div className={headerBlockClasses}>
        <span>{intl.formatMessage(messages.connectIntroTextLine1)}</span>
        <br />
        <span>{intl.formatMessage(messages.connectIntroTextLine2)}</span>
        <br />
        <span>{intl.formatMessage(globalMessages.hwConnectDialogConnectIntroTextLine3)}</span>
        <br />
      </div>
    ) : (
      <div className={headerBlockClasses}>
        <span>
          {intl.formatMessage(messages.connectIntroTextLine1) + ' '}
          {intl.formatMessage(messages.connectIntroTextLine2) + ' '}
          {intl.formatMessage(globalMessages.hwConnectDialogConnectIntroTextLine3)}
        </span>
      </div>
    );

    let middleBlock = null;
    let backButton = null;

    switch (progressInfo.stepState) {
      case StepState.LOAD:
        backButton = (<DialogBackButton onBack={goBack} />);
        middleBlock = (
          <div className={classnames([middleBlockClasses, styles.middleConnectLoadBlock])}>
            <img src={classicTheme ? connectLoadGIF : connectLoadImage} alt="" />
          </div>);
        break;
      case StepState.PROCESS:
        backButton = null;
        middleBlock = (
          <div className={classnames([middleBlockClasses, styles.middleConnectProcessBlock])}>
            <img src={classicTheme ? connectStartGIF : connectLoadImage} alt="" />
          </div>);
        break;
      case StepState.ERROR:
        backButton = (<DialogBackButton onBack={goBack} />);
        middleBlock = (
          <div className={classnames([middleBlockClasses, middleConnectErrorBlockClasses])}>
            <SvgInline svg={classicTheme ? connectErrorSVG : connectErrorImage} />
          </div>);
        break;
      default:
        Logger.error('trezorConnect::ConnectDialog::render: something unexpected happened');
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
        className={classnames([styles.component, 'ConnectDialog'])}
        title={intl.formatMessage(globalMessages.trezorConnectAllDialogTitle)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        onClose={cancel}
        backButton={backButton}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
      >
        <ProgressStepBlock progressInfo={progressInfo} classicTheme={classicTheme} />
        {introBlock}
        {middleBlock}
        <HWErrorBlock progressInfo={progressInfo} error={error} classicTheme={classicTheme} />
        <HelpLinkBlock />
      </Dialog>);
  }
}
