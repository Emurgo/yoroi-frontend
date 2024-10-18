// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';

import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import DialogBackButton from '../../../widgets/DialogBackButton';

import ProgressStepBlock from '../common/ProgressStepBlock';
import HelpLinkBlock from './HelpLinkBlock';
import HWErrorBlock from '../common/HWErrorBlock';

import { ReactComponent as ExternalLinkSVG }  from '../../../../assets/images/link-external.inline.svg';
import { ReactComponent as AboutPrerequisiteIconSVG }  from '../../../../assets/images/hardware-wallet/check-prerequisite-header-icon.inline.svg';
import { ReactComponent as AboutPrerequisiteTrezorSVG }  from '../../../../assets/images/hardware-wallet/ledger/check.inline.svg';
import { ReactComponent as AboutLedgerSVG }  from '../../../../assets/images/hardware-wallet/ledger/check-modern.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';

import styles from './CheckDialog.scss';

const messages = defineMessages({
  aboutPrerequisite1Part1: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part1',
    defaultMessage: '!!!Ledger Nano S',
  },
  aboutPrerequisite1Part1Link: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part1.link',
    defaultMessage: '!!!https://shop.ledger.com/products/ledger-nano-s/',
  },
  aboutPrerequisite1Part2: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part2',
    defaultMessage: '!!! or ',
  },
  aboutPrerequisite1Part3: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part3',
    defaultMessage: '!!!Ledger Nano X(Using USB cable)',
  },
  aboutPrerequisite1Part3Link: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part3.link',
    defaultMessage: '!!!https://shop.ledger.com/pages/ledger-nano-x/',
  },
  aboutPrerequisite2: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.2',
    defaultMessage: '!!!Cardano ADA app must be installed on the Ledger device.',
  },
  aboutPrerequisite3: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.3',
    defaultMessage: '!!!Cardano ADA app must remain open on the Ledger device.',
  },
  aboutPrerequisite5: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.5',
    defaultMessage: '!!!Trezor device must remain connected to the computer throughout the process',
  },
});

type Props = {|
  +progressInfo: ProgressInfo,
  +isActionProcessing: boolean,
  +error: ?LocalizableError,
  +onExternalLinkClick: MouseEvent => void,
  +submit: void => void,
  +cancel: void => void,
  +onBack: void => void,
|};

@observer
export default class CheckDialog extends Component<Props> {

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
      submit,
      cancel,
    } = this.props;

    const middleBlock = (
      <div className={classnames([styles.middleBlock, styles.component])}>
        <AboutLedgerSVG/>

        <div className={styles.prerequisiteBlock}>
          <div>
            <AboutPrerequisiteIconSVG />
            <span className={styles.prerequisiteHeaderText}>
              {intl.formatMessage(globalMessages.hwConnectDialogAboutPrerequisiteHeader)}
            </span>
          </div>
          <ul>
            <li key="1">
              <a
                href={intl.formatMessage(messages.aboutPrerequisite1Part1Link)}
                onClick={event => onExternalLinkClick(event)}
              >
                {intl.formatMessage(messages.aboutPrerequisite1Part1) + ' '}
                <ExternalLinkSVG />
              </a>
              {intl.formatMessage(messages.aboutPrerequisite1Part2)}
              <a
                href={intl.formatMessage(messages.aboutPrerequisite1Part3Link)}
                onClick={event => onExternalLinkClick(event)}
              >
                {intl.formatMessage(messages.aboutPrerequisite1Part3) + ' '}
                <ExternalLinkSVG />
              </a>
            </li>
            <li key="2">{intl.formatMessage(messages.aboutPrerequisite2)}</li>
            <li key="3">{intl.formatMessage(messages.aboutPrerequisite3)}</li>
            <li key="4">{intl.formatMessage(globalMessages.hwConnectDialogAboutPrerequisite4)}</li>
            <li key="5">{intl.formatMessage(messages.aboutPrerequisite5)}</li>
          </ul>
        </div>
      </div>);

    const dailogActions = [{
      label: intl.formatMessage(globalMessages.nextButtonLabel),
      primary: true,
      onClick: submit,
      isSubmitting: isActionProcessing,
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'CheckDialog', styles.ledger])}
        title={intl.formatMessage(globalMessages.ledgerConnectAllDialogTitle)}
        dialogActions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        backButton={<DialogBackButton onBack={this.props.onBack} />}
        onClose={cancel}
      >
        <ProgressStepBlock progressInfo={progressInfo} />
        {middleBlock}
        {error &&
          <HWErrorBlock progressInfo={progressInfo} error={error} />
        }
        <HelpLinkBlock onExternalLinkClick={onExternalLinkClick} />
      </Dialog>);
  }
}
