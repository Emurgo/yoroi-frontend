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
});

type Props = {|
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
    const { progressInfo, submit, cancel, classicTheme, votingKey } = this.props;

    const dailogActions = [
      {
        label: intl.formatMessage(globalMessages.completeLabel),
        primary: true,
        onClick: submit,
      },
    ];

    return (
      <Dialog
        className={classnames([styles.dialog])}
        title={intl.formatMessage(globalMessages.votingRegistrationTitle)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
      >
        <ProgressStepBlock progressInfo={progressInfo} classicTheme={classicTheme} />

        <div className={classnames([styles.lineTitle, styles.firstItem])}>
          {intl.formatMessage(messages.lineTitle)}
        </div>

        <div className={styles.lineText}>
          {intl.formatMessage(messages.line2)}
        </div>

        <div className={styles.lineBold}>
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
