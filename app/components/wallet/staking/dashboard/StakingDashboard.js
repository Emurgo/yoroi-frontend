// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import GraphWrapper from './GraphWrapper';
import type { GraphItems } from './GraphWrapper';
import styles from './StakingDashboard.scss';
import globalMessages from '../../../../i18n/global-messages';
import WarningBox from '../../../widgets/WarningBox';
import InformativeError from '../../../widgets/InformativeError';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import CenteredBarDecoration from '../../../widgets/CenteredBarDecoration';
import PageSelect from '../../../widgets/PageSelect';
import VerticallyCenteredLayout from '../../../layout/VerticallyCenteredLayout';
import LocalizableError from '../../../../i18n/LocalizableError';
import InvalidURIImg from '../../../../assets/images/uri/invalid-uri.inline.svg';
import ErrorBlock from '../../../widgets/ErrorBlock';
import type { CertificateForKey } from '../../../../api/ada/lib/storage/database/primitives/api/read';

const messages = defineMessages({
  positionsLabel: {
    id: 'wallet.dashboard.graphType.positions',
    defaultMessage: '!!!Positions',
  },
  costsLabel: {
    id: 'wallet.dashboard.graphType.costs',
    defaultMessage: '!!!Costs',
  },
  pendingTxWarning: {
    id: 'wallet.dashboard.warning.pendingTx',
    defaultMessage: '!!!Staking dashboard information will update once your pending transaction is confirmed',
  },
});

const emptyDashboardMessages = defineMessages({
  title: {
    id: 'wallet.dashboard.empty.title',
    defaultMessage: '!!!You have not delegated your ADA yet',
  },
  text: {
    id: 'wallet.dashboard.empty.text',
    defaultMessage: '!!!Go to Simple or Advance Staking to choose what stake pool you want to delegate in. Note, you may delegate only to one stake pool in this Testnet'
  }
});

export type RewardsGraphData = {|
  +items: ?{|
    totalRewards: Array<GraphItems>,
    perEpochRewards: Array<GraphItems>,
  |},
  +error: ?LocalizableError,
|};
export type GraphData = {|
  +rewardsGraphData: RewardsGraphData,
|};

type Props = {|
  +themeVars: Object,
  +graphData: GraphData,
  +stakePools: {| error: LocalizableError, |} | {| pools: null | Array<Node> |},
  +epochProgress: Node,
  +userSummary: Node,
  +upcomingRewards: void | Node,
  +hasAnyPending: boolean,
  +pageInfo: void | {|
    +currentPage: number,
    +numPages: number,
    +goToPage: number => void,
  |},
  +delegationHistory: ?Array<CertificateForKey>,
  +epochLength: ?number,
|};

@observer
export default class StakingDashboard extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      graphData,
    } = this.props;

    const pendingTxWarningComponent = this.props.hasAnyPending
      ? (
        <div className={styles.warningBox}>
          <WarningBox>
            {this.context.intl.formatMessage(messages.pendingTxWarning)}
          </WarningBox>
        </div>
      )
      : (null);

    // don't show anything when user has never delegated
    const hideGraph = this.props.delegationHistory != null &&
      this.props.delegationHistory.length === 0;

    const graphs = hideGraph
      ? null
      : (
        <div className={styles.graphsWrapper}>
          {this._displayGraph(graphData.rewardsGraphData)}
          {/* <GraphWrapper
            themeVars={themeVars}
            tabs={[
              intl.formatMessage(messages.positionsLabel),
              intl.formatMessage(globalMessages.marginsLabel),
              intl.formatMessage(messages.costsLabel),
            ]}
            graphName="positions"
            data={graphData.positionsGraphData}
          /> */}
        </div>
      );
    return (
      <div className={styles.page}>
        <div className={styles.contentWrap}>
          {pendingTxWarningComponent}
          <div className={styles.statsWrapper}>
            <div>
              {this.props.epochProgress}
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                {this.props.userSummary}
              </div>
              <div className={styles.summaryItem}>
                {this.props.upcomingRewards}
              </div>
            </div>
          </div>
          <div className={styles.pageSelect}>
            <CenteredBarDecoration>
              <PageSelect
                currentPage={this.props.pageInfo?.currentPage ?? 0}
                numPages={this.props.pageInfo?.numPages ?? 0}
                goToPage={this.props.pageInfo?.goToPage ?? (() => {})}
              />
            </CenteredBarDecoration>
          </div>
          <div className={styles.bodyWrapper}>
            {graphs}
            {this.displayStakePools(hideGraph)}
          </div>
        </div>
      </div>
    );
  }

  _displayGraph: RewardsGraphData => Node = (graphData) => {
    const { intl } = this.context;
    if (graphData.error) {
      return (
        <div className={styles.poolError}>
          <center><InvalidURIImg /></center>
          <ErrorBlock
            error={graphData.error}
          />
        </div>
      );
    }
    if (graphData.items == null) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }
    const items = graphData.items;
    return (
      <GraphWrapper
        themeVars={this.props.themeVars}
        tabs={[
          {
            tabName: intl.formatMessage(globalMessages.rewardsLabel),
            data: items.perEpochRewards,
            primaryBarLabel: intl.formatMessage(globalMessages.rewardsLabel),
            yAxisLabel: intl.formatMessage(globalMessages.rewardsLabel),
          },
          {
            tabName: intl.formatMessage(globalMessages.totalRewardsLabel),
            data: items.totalRewards,
            primaryBarLabel: intl.formatMessage(globalMessages.totalRewardsLabel),
            yAxisLabel: intl.formatMessage(globalMessages.rewardsLabel),
          },
          // intl.formatMessage(globalMessages.marginsLabel),
        ]}
        epochLength={this.props.epochLength}
      />
    );
  }

  displayStakePools: boolean => Node = (hideGraph) => {
    const width = classnames([
      // if they've delegated before we need to make space for the chart
      !hideGraph ? styles.stakePoolMaxWidth : null,
      styles.stakePool,
    ]);
    const { intl } = this.context;
    if (this.props.stakePools.error) {
      return (
        <div className={styles.poolError}>
          <center><InvalidURIImg /></center>
          <ErrorBlock
            error={this.props.stakePools.error}
          />
        </div>
      );
    }
    if (this.props.stakePools.pools === null || this.props.pageInfo == null) {
      return (
        <div className={width}>
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </div>
      );
    }
    const currPool = this.props.pageInfo.currentPage;
    if (this.props.stakePools.pools.length === 0) {
      return (
        <div className={width}>
          <InformativeError
            title={intl.formatMessage(emptyDashboardMessages.title)}
            text={!hideGraph
              // no need to explain to user how to delegate their ADA if they've done it before
              ? null
              : intl.formatMessage(emptyDashboardMessages.text)
            }
          />
        </div>
      );
    }
    return (
      <div className={width}>
        {this.props.stakePools.pools[currPool]}
      </div>
    );
  }
}
