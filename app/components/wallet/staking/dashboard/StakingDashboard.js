// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import GraphWrapper from './GraphWrapper';
import RewardPopup from './RewardPopup';
import EmptyDashboard from './EmptyDashboard';
import styles from './StakingDashboard.scss';
import globalMessages from '../../../../i18n/global-messages';

const messages = defineMessages({
  positionsLabel: {
    id: 'wallet.dashboard.graphType.positions',
    defaultMessage: '!!!Positions',
  },
  costsLabel: {
    id: 'wallet.dashboard.graphType.costs',
    defaultMessage: '!!!Costs',
  },
});

type Props = {|
  themeVars: Object,
  currentReward: string,
  followingReward: string,
  totalGraphData: Array<Object>,
  positionsGraphData: Array<Object>,
  stakePools: Array<Node>,
  epochProgress: Node,
  userSummary: Node,
|};

@observer
export default class StakingDashboard extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      themeVars,
      currentReward,
      followingReward,
      totalGraphData,
      positionsGraphData,
    } = this.props;

    const { intl } = this.context;

    // TODO: enable graphs eventually
    // eslint-disable-next-line no-unused-vars
    const graphs = (
      <div className={styles.graphsWrapper}>
        <GraphWrapper
          themeVars={themeVars}
          tabs={[
            intl.formatMessage(globalMessages.totalAdaLabel),
            intl.formatMessage(globalMessages.marginsLabel),
            intl.formatMessage(globalMessages.rewardsLabel),
          ]}
          graphName="total"
          data={totalGraphData}
        />
        <GraphWrapper
          themeVars={themeVars}
          tabs={[
            intl.formatMessage(messages.positionsLabel),
            intl.formatMessage(globalMessages.marginsLabel),
            intl.formatMessage(messages.costsLabel),
          ]}
          graphName="positions"
          data={positionsGraphData}
        />
      </div>
    );
    return (
      <div className={styles.page}>
        <div className={styles.contentWrap}>
          <div className={styles.rewards}>
            <RewardPopup currentText={currentReward} followingText={followingReward} />
          </div>
          <div className={styles.statsWrapper}>
            {this.props.epochProgress}
            <div className={styles.summary}>
              {this.props.userSummary}
            </div>
          </div>
          {this.props.stakePools.length > 0 ? (
            <div className={styles.bodyWrapper}>
              <div className={styles.stakePool}>
                {this.props.stakePools}
              </div>
            </div>
          ) : (
            <EmptyDashboard />
          )}
        </div>
      </div>
    );
  }

}
