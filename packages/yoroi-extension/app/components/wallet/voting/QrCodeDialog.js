// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ProgressStepBlock from './ProgressStepBlock';
import { ProgressInfo } from '../../../stores/ada/VotingStore';
import QrCodeWrapper from '../../widgets/QrCodeWrapper';
import type { StepsList } from './types';

import styles from './QrCodeDialog.scss';

const messages = defineMessages({
  lineTitle: {
    id: 'wallet.voting.dialog.step.qr.lineTitle',
    defaultMessage: '!!!Use the Catalyst Voting App to scan the QR code',
  },
  line2: {
    id: 'wallet.voting.dialog.step.qr.line2',
    defaultMessage: '!!!The following QR code is the generated certificate required by the Catalyst App to be able to participate in the voting process of Cardano.',
  },
  line3: {
    id: 'wallet.voting.dialog.step.qr.line3',
    defaultMessage: '!!!Also we suggest to take a screenshot of it as a backup — you won’t be able to access this QR code after clicking Complete.',
  },
  actionButton: {
    id: 'wallet.voting.dialog.step.qr.actionButton',
    defaultMessage: '!!!Confirm that I saved the QR code'
  }
});

type Props = {|
  +stepsList: StepsList,
  +progressInfo: ProgressInfo,
  +onExternalLinkClick: MouseEvent => void,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
  +classicTheme: boolean,
  +votingKey: string | null,
|};

@observer
export default class QrCodeDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { stepsList, progressInfo, submit, cancel, classicTheme, votingKey } = this.props;

    const dialogActions = [
      {
        label: intl.formatMessage(messages.actionButton),
        primary: true,
        onClick: submit,
      },
    ];

    return (
      <Dialog
        className={classnames([styles.dialog])}
        title={intl.formatMessage(globalMessages.votingRegistrationTitle)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
      >
        <ProgressStepBlock
          stepsList={stepsList}
          progressInfo={progressInfo}
          classicTheme={classicTheme}
        />

        <div className={classnames([styles.lineTitle, styles.firstItem])}>
          {intl.formatMessage(messages.lineTitle)}
        </div>

        <div className={styles.lineText}>
          {intl.formatMessage(messages.line2)}
        </div>

        <div className={classnames([styles.lineBold, styles.importantText])}>
          {intl.formatMessage(messages.line3)}
        </div>

        <div className={classnames([styles.qrCodeContainer, styles.lastItem])}>
          {votingKey !== null ? (
            <div className={styles.qrCode}>
              <QrCodeWrapper value={votingKey} size={152} />
            </div>
          ) : (
            ''
          )}
        </div>
      </Dialog>
    );
  }
}
