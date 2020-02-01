// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import type { ReputationObject } from '../../../../api/ada/lib/state-fetch/types';

import styles from './PoolWarningDialog.scss';

const messages = defineMessages({
  header: {
    id: 'wallet.dashboard.poolWarnings.header',
    defaultMessage: '!!!Based on network activity, it seems this pool:',
  },
  multiBlock: {
    id: 'wallet.dashboard.poolWarnings.multiBlock',
    defaultMessage: '!!!Creates multiple blocks in the same slot (purposely causing forks)',
  },
  censoringTxs: {
    id: 'wallet.dashboard.poolWarnings.censoringTxs',
    defaultMessage: '!!!Purposely excludes transactions from blocks (censoring the network)',
  },
  explanation: {
    id: 'wallet.dashboard.poolWarnings.explanation',
    defaultMessage: '!!!Unlike Proof of Work (PoW) where users cannot do anything about adversarial behavior, Proof of Stake (PoS) blockchains like Cardano empower users to punish bad actors',
  },
  suggested: {
    id: 'wallet.dashboard.poolWarnings.suggested',
    defaultMessage: '!!!We suggest contacting the pool owner through the stake pool\'s webpage to ask about their behavior. Remember, you can change your delegation at any time without any interruptions in rewards.',
  },
  unknown: {
    id: 'wallet.dashboard.poolWarnings.unknown',
    defaultMessage: '!!!Causes some unknown issue (look online for more info)',
  },
});

type Props = {|
  +classicTheme: boolean,
  +close: void => void,
  +reputationInfo: ReputationObject,
|};

export default class PoolWarningDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      classicTheme,
    } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.attentionTitle)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={this.props.close}
        classicTheme={classicTheme}
      >
        <div className={styles.component}>
          <div className={styles.header}>
            {intl.formatMessage(messages.header)}
          </div>
          <ul>
            {this.getMessage().map((issue, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={i}>{issue}</li>
            ))}
          </ul>
          <div className={styles.footer}>
            {intl.formatMessage(messages.suggested)}
          </div>
        </div>
      </Dialog>
    );
  }

  getMessage: void => Array<string> = () => {
    const { intl } = this.context;

    const problems = [];
    const val = this.props.reputationInfo.node_flags ?? 0;
    if ((val & 1) !== 0) {
      problems.push(intl.formatMessage(messages.multiBlock));
    }
    if ((val & 2) !== 0) {
      problems.push(intl.formatMessage(messages.censoringTxs));
    }
    if (val !== 0 && problems.length === 0) {
      problems.push(intl.formatMessage(messages.unknown));
    }

    return problems;
  }
}
