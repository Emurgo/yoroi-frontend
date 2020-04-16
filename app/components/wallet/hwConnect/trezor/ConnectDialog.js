// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';

import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';

import Dialog from '../../../widgets/Dialog';
import DialogBackButton from '../../../widgets/DialogBackButton';
import DialogCloseButton from '../../../widgets/DialogCloseButton';

import ProgressStepBlock from '../common/ProgressStepBlock';
import HelpLinkBlock from './HelpLinkBlock';
import HWErrorBlock from '../common/HWErrorBlock';

import connectLoadImage from '../../../../assets/images/hardware-wallet/trezor/connect-load-modern.inline.gif';
import ConnectErrorImage from '../../../../assets/images/hardware-wallet/trezor/connect-error-modern.inline.svg';

import connectLoadGIF from '../../../../assets/images/hardware-wallet/trezor/connect-load.gif';
import ConnectErrorSVG from '../../../../assets/images/hardware-wallet/trezor/connect-error.inline.svg';

import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';
import { StepState } from '../../../widgets/ProgressSteps';

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
  +progressInfo: ProgressInfo,
  +isActionProcessing: boolean,
  +error: ?LocalizableError,
  +onExternalLinkClick: MouseEvent => void,
  +goBack: void => void,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
  +classicTheme: boolean
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
      onExternalLinkClick,
      goBack,
      submit,
      cancel,
      classicTheme
    } = this.props;

    const introBlock = classicTheme ? (
      <div className={classnames([headerMixin.headerBlock, styles.headerBlock])}>
        <span>{intl.formatMessage(messages.connectIntroTextLine1)}</span>
        <br />
        <span>{intl.formatMessage(messages.connectIntroTextLine2)}</span>
        <br />
        <span>{intl.formatMessage(globalMessages.hwConnectDialogConnectIntroTextLine3)}</span>
        <br />
      </div>
    ) : (
      <div className={classnames([headerMixin.headerBlock, styles.headerBlock])}>
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
          <div className={classnames([styles.middleBlock, styles.middleConnectLoadBlock])}>
            <img src={classicTheme ? connectLoadGIF : connectLoadImage} alt="" />
          </div>);
        break;
      case StepState.PROCESS:
        backButton = null;
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectProcessBlock])}>
            <img src={classicTheme ? connectStartGIF : connectLoadImage} alt="" />
          </div>);
        break;
      case StepState.ERROR:
        backButton = (<DialogBackButton onBack={goBack} />);
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectErrorBlock])}>
            {classicTheme
              ? <ConnectErrorSVG />
              : <ConnectErrorImage />
            }
          </div>);
        break;
      default:
        Logger.error('trezorConnect::ConnectDialog::render: something unexpected happened');
        break;
    }

    const dailogActions = [{
      label: intl.formatMessage(globalMessages.hwConnectDialogConnectButtonLabel),
      primary: true,
      isSubmitting: isActionProcessing,
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
      >
        <ProgressStepBlock progressInfo={progressInfo} classicTheme={classicTheme} />
        {introBlock}
        {middleBlock}
        {error &&
          <HWErrorBlock progressInfo={progressInfo} error={error} classicTheme={classicTheme} />
        }
        <HelpLinkBlock onExternalLinkClick={onExternalLinkClick} />
      </Dialog>);
  }
}
