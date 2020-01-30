// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage, } from 'react-intl';

import { DECIMAL_PLACES_IN_ADA } from '../../../../config/numbersConfig';
import Card from './Card';
import styles from './UserSummary.scss';
import IconAda from '../../../../assets/images/dashboard/total-ada.inline.svg';
import IconRewards from '../../../../assets/images/dashboard/total-rewards.inline.svg';
import IconDelegated from '../../../../assets/images/dashboard/total-delegated.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import TooltipBox from '../../../widgets/TooltipBox';
import WarningIcon from '../../../../assets/images/attention-modern.inline.svg';

import LoadingSpinner from '../../../widgets/LoadingSpinner';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.summary.title',
    defaultMessage: '!!!Your Summary',
  },
  rewardsLabel: {
    id: 'wallet.dashboard.summary.rewardsTitle',
    defaultMessage: '!!!Total Rewards',
  },
  delegatedLabel: {
    id: 'wallet.dashboard.summary.delegatedTitle',
    defaultMessage: '!!!Total Delegated',
  },
  note: {
    id: 'wallet.dashboard.summary.note',
    defaultMessage: '!!!Less than you expected?',
  },
  mangledPopupDialogLine1: {
    id: 'wallet.dashboard.summary.mangled.line1',
    defaultMessage: '!!!Your wallet has {adaAmount} ADA with a different delegation preferences.',
  },
  mangledPopupDialogLine2: {
    id: 'wallet.dashboard.summary.mangled.line2',
    defaultMessage: '!!!We recommend to {transactionMessage} to delegate your ADA',
  },
  makeTransaction: {
    id: 'wallet.dashboard.summary.mangled.makeTx',
    defaultMessage: '!!!make a transaction',
  },
});

type Props = {|
  +totalAdaSum: void | string,
  +totalRewards: void | string,
  +totalDelegated: void | string,
  +openLearnMore: void => void,
  +mangledUtxoSum: BigNumber,
  +onUnmangle: void => void,
|};

type State = {|
  mangledPopupOpen: boolean,
|};

@observer
export default class UserSummary extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    mangledPopupOpen: false,
  };

  render() {
    const { intl } = this.context;
    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={styles.wrapper}>
          {this.getTotalAda()}
          {this.getTotalRewards()}
          {this.getTotalDelegated()}
        </div>
      </Card>
    );
  }

  getTotalAda: void => Node = () => {
    const { intl } = this.context;
    return (
      <div className={styles.column}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <IconAda />
          </div>
        </div>
        <h3 className={styles.label}>
          {intl.formatMessage(globalMessages.totalAdaLabel)}:
        </h3>
        {this.props.totalAdaSum != null
          ? (<p className={styles.value}>{this.props.totalAdaSum} ADA</p>)
          : (<LoadingSpinner small />)
        }
      </div>
    );
  }

  getTotalRewards: void => Node = () => {
    const { intl } = this.context;
    return (
      <div className={styles.column}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <IconRewards />
          </div>
        </div>
        <h3 className={styles.label}>
          {intl.formatMessage(messages.rewardsLabel)}:
        </h3>
        {this.props.totalRewards != null
          ? (
            <>
              <p className={styles.value}>
                {this.props.totalRewards} ADA
              </p>
              <span
                className={styles.note}
                role="button"
                tabIndex={0}
                onKeyPress={() => null}
                onClick={this.props.openLearnMore}
              >
                {intl.formatMessage(messages.note)}
              </span>
            </>
          )
          : (<LoadingSpinner small />)
        }
      </div>
    );
  }

  getTotalDelegated: void => Node = () => {
    const { intl } = this.context;

    const mangledWarningIcon = this.props.mangledUtxoSum.gt(0)
      ? (
        <div className={styles.mangledWarningIcon}>
          <WarningIcon
            width="24"
            height="24"
            onClick={() => this.setState(prevState => ({
              mangledPopupOpen: !prevState.mangledPopupOpen
            }))}
          />
        </div>
      )
      : [];

    return (
      <div className={styles.column}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <IconDelegated />
          </div>
          {mangledWarningIcon}
          <div className={styles.mangledPopup}>
            {this.state.mangledPopupOpen && (
              <TooltipBox
                onClose={() => this.setState(() => ({ mangledPopupOpen: false }))}
              >
                <p>
                  <FormattedMessage
                    {...messages.mangledPopupDialogLine1}
                    values={{
                      adaAmount: this.props.mangledUtxoSum
                        .shiftedBy(-DECIMAL_PLACES_IN_ADA)
                        .toFormat(DECIMAL_PLACES_IN_ADA),
                    }}
                  />
                </p>
                <p>
                  <FormattedMessage
                    {...messages.mangledPopupDialogLine2}
                    values={{
                      transactionMessage: (
                        <span
                          className={styles.link}
                          onClick={this.props.onUnmangle}
                          role="button"
                          tabIndex={0}
                          onKeyPress={this.props.onUnmangle}
                        >
                          {intl.formatMessage(messages.makeTransaction)}
                        </span>
                      ),
                    }}
                  />
                </p>
              </TooltipBox>
            )}
          </div>
        </div>
        <h3 className={styles.label}>
          {intl.formatMessage(messages.delegatedLabel)}:
        </h3>
        {this.props.totalDelegated != null
          ? (<p className={styles.value}>{this.props.totalDelegated} ADA</p>)
          : (<div><LoadingSpinner small /></div>)
        }
      </div>
    );
  }
}
