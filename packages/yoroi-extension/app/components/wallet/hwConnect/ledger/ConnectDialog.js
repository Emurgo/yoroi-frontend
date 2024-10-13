// @flow
import type { Node } from 'react';
import { Component } from 'react';
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

import connectLoadGIF from '../../../../assets/images/hardware-wallet/ledger/connect-load.gif';
import { ReactComponent as ConnectErrorSVG }  from '../../../../assets/images/hardware-wallet/ledger/connect-error.inline.svg';

import { ReactComponent as ConnectErrorLedgerSVG }  from '../../../../assets/images/hardware-wallet/ledger/connect-error-modern.inline.svg';
import connectLoadLedgerGIF from '../../../../assets/images/hardware-wallet/ledger/connect-load-modern.inline.gif';

import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';
import { StepState } from '../../../widgets/ProgressSteps';

import { Logger } from '../../../../utils/logging';

import styles from '../common/ConnectDialog.scss';
import headerMixin from '../../../mixins/HeaderBlock.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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

type Props = {|
  +progressInfo: ProgressInfo,
  +isActionProcessing: boolean,
  +error: ?LocalizableError,
  +onExternalLinkClick: MouseEvent => void,
  +goBack: void => void,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
|};

@observer
export default class ConnectDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const {
      progressInfo,
      isActionProcessing,
      error,
      onExternalLinkClick,
      goBack,
      submit,
      cancel,
    } = this.props;

    const introBlock = (
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
            <img src={connectLoadLedgerGIF} alt="" />
          </div>);
        break;
      case StepState.PROCESS:
        backButton = null;
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectProcessBlock])}>
            <img src={connectLoadLedgerGIF} alt="" />
          </div>);
        break;
      case StepState.ERROR:
        backButton = (<DialogBackButton onBack={goBack} />);
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleConnectErrorBlock])}>
            {<ConnectErrorLedgerSVG/>
            }
          </div>);
        break;
      default:
        Logger.error('ledger::ConnectDialog::render: something unexpected happened');
        break;
    }

    const dailogActions = [{
      label: intl.formatMessage(globalMessages.connectLabel),
      primary: true,
      isSubmitting: isActionProcessing,
      onClick: submit,
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'ConnectDialog'])}
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
        {error &&
          <HWErrorBlock progressInfo={progressInfo} error={error} />
        }
        <HelpLinkBlock onExternalLinkClick={onExternalLinkClick} />
      </Dialog>);
  }
}
