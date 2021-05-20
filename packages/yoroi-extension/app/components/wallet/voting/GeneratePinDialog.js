// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';

import globalMessages from '../../../i18n/global-messages';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import DialogBackButton from '../../widgets/DialogBackButton';

import ProgressStepBlock from './ProgressStepBlock';

import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ProgressInfo } from '../../../stores/ada/VotingStore';

import styles from './GeneratePinDialog.scss';
import type { StepsList } from './types';

const messages = defineMessages({
  line1: {
    id: 'wallet.voting.dialog.step.pin.line1',
    defaultMessage: '!!!Please write down this PIN as you will need it <strong>every time</strong> you want to access the Catalyst Voting app.',
  },
  actionButton: {
    id: 'wallet.voting.dialog.step.pin.actionButton',
    defaultMessage: '!!!Confirm that I wrote down the PIN',
  },
});

type Props = {|
  +stepsList: StepsList,
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
    const { stepsList, progressInfo, next, cancel, classicTheme, pin } = this.props;

    const dialogActions = [
      {
        label: intl.formatMessage(messages.actionButton),
        primary: true,
        onClick: next,
      },
    ];

    const pinCards = (
      <div className={classnames([styles.pinContainer, styles.lastItem])}>
        {pin.map((value, index) => {
          // eslint-disable-next-line react/no-array-index-key
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
        <ProgressStepBlock
          stepsList={stepsList}
          progressInfo={progressInfo}
          classicTheme={classicTheme}
        />

        <div className={classnames([styles.lineText, styles.firstItem, styles.importantText])}>
          <FormattedHTMLMessage {...messages.line1} />
        </div>
        {pinCards}
      </Dialog>
    );
  }
}
