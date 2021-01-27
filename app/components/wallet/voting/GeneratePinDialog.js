// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';

import globalMessages from '../../../i18n/global-messages';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import DialogBackButton from '../../widgets/DialogBackButton';

import ProgressStepBlock from './ProgressStepBlock';

import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ProgressInfo } from '../../../stores/ada/VotingStore';

import styles from './GeneratePinDialog.scss';

const messages = defineMessages({
  line1: {
    id: 'wallet.voting.dialog.step.pin.line1',
    defaultMessage: '!!!Please write down this PIN as it will be used in a later step to complete the registration process inside the Catalyst Voting App.',
  },
});

type Props = {|
  +progressInfo: ProgressInfo,
  +next: void => void,
  +cancel: void => void,
  +onBack: void => void,
  +classicTheme: boolean,
  +pin: Array<number>,
|};

@observer
export default class GeneratePinDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { progressInfo, next, cancel, classicTheme, pin } = this.props;

    const dialogActions = [
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        primary: true,
        onClick: next,
      },
    ];

    const pinCards = (
      <div className={classnames([styles.pinContainer, styles.lastItem])}>
        {pin.map((value, index) => {
          return <div key={index} className={styles.pin}><span>{value}</span></div>;
        })}
      </div>
    );

    return (
      <Dialog
        className={classnames([styles.dialog])}
        title={intl.formatMessage(globalMessages.votingRegistrationTitle)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        backButton={<DialogBackButton onBack={this.props.onBack} />}
        onClose={cancel}
      >
        <ProgressStepBlock progressInfo={progressInfo} classicTheme={classicTheme} />

        <div className={classnames([styles.lineText, styles.firstItem])}>
          {intl.formatMessage(messages.line1)}
        </div>
        {pinCards}
      </Dialog>
    );
  }
}
