// @flow
import { Component } from 'react';
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
import VerticallyCenteredLayout from '../../../layout/VerticallyCenteredLayout';
import LocalizableError from '../../../../i18n/LocalizableError';
import { ReactComponent as InvalidURIImg } from '../../../../assets/images/uri/invalid-uri.inline.svg';
import ErrorBlock from '../../../widgets/ErrorBlock';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Skeleton, Typography } from '@mui/material';

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
    defaultMessage:
      '!!!Staking dashboard information will update once your pending transaction is confirmed',
  },
  title: {
    id: 'wallet.dashboard.stakePool.title',
    defaultMessage: '!!!Stake Pool Delegated',
  },
});

export const emptyDashboardMessages: Object = defineMessages({
  title: {
    id: 'wallet.dashboard.empty.title',
    defaultMessage: '!!!You have not delegated your {ticker} yet',
  },
  text: {
    id: 'wallet.dashboard.empty.text',
    defaultMessage:
      '!!!Go to the delegation page to choose what stake pool you want to delegate in.',
  },
});

export type RewardsGraphData = {|
  +items: ?{|
    totalRewards: Array<GraphItems>,
    perEpochRewards: Array<GraphItems>,
  |},
  +hideYAxis: boolean,
  +error: ?LocalizableError,
|};
export type GraphData = {|
  +rewardsGraphData: RewardsGraphData,
|};

type Props = {|
  +graphData: GraphData,
  +stakePools: {| error: LocalizableError |} | {| pools: null | Array<Node | void> |},
  +userSummary: Node,
  +hasAnyPending: boolean,
  +pageInfo: void | {|
    +currentPage: number,
    +numPages: number,
    +goToPage: number => void,
  |},
  +isUnregistered: boolean,
  +epochLength: ?number,
  +ticker: string,
|};

@observer
export default class StakingDashboard extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { graphData, isUnregistered } = this.props;

    const pendingTxWarningComponent = this.props.hasAnyPending ? (
      <div className={styles.warningBox}>
        <WarningBox>{this.context.intl.formatMessage(messages.pendingTxWarning)}</WarningBox>
      </div>
    ) : null;

    const graphs = isUnregistered ? null : (
      <div className={styles.graphsWrapper}>
        {this._displayGraph(graphData.rewardsGraphData)}
        {/* <GraphWrapper
            themeVars={this.props.themeVars}
            tabs={[
              this.context.intl.formatMessage(messages.positionsLabel),
              this.context.intl.formatMessage(globalMessages.marginsLabel),
              this.context.intl.formatMessage(messages.costsLabel),
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
            <div className={styles.summary}>
              <div className={styles.summaryItem}>{this.props.userSummary}</div>
            </div>
          </div>
          <div className={styles.bodyWrapper}>
            {graphs}
            {this.displayStakePools(isUnregistered)}
          </div>
        </div>
      </div>
    );
  }

  _displayGraph: RewardsGraphData => Node = graphData => {
    const { intl } = this.context;
    if (graphData.error) {
      return (
        <div className={styles.poolError}>
          <center>
            <InvalidURIImg />
          </center>
          <ErrorBlock error={graphData.error} />
        </div>
      );
    }

    const items = graphData.items;
    return (
      <GraphWrapper
        tabs={[
          {
            tabName: intl.formatMessage(globalMessages.rewardsLabel),
            data: items ? items.perEpochRewards : [],
            primaryBarLabel: intl.formatMessage(globalMessages.rewardsLabel),
            yAxisLabel: intl.formatMessage(globalMessages.rewardsLabel),
            hideYAxis: graphData.hideYAxis,
          },
          {
            tabName: intl.formatMessage(globalMessages.totalRewardsLabel),
            data: items ? items.totalRewards : [],
            primaryBarLabel: intl.formatMessage(globalMessages.totalRewardsLabel),
            yAxisLabel: intl.formatMessage(globalMessages.rewardsLabel),
            hideYAxis: graphData.hideYAxis,
          },
        ]}
        epochLength={this.props.epochLength}
      />
    );
  };

  displayStakePools: boolean => Node = isUnregistered => {
    const width = classnames([
      // if they've delegated before we need to make space for the chart
      !isUnregistered ? styles.stakePoolMaxWidth : null,
      styles.stakePool,
    ]);
    const { intl } = this.context;
    if (this.props.stakePools.error) {
      return (
        <div className={styles.poolError}>
          <center>
            <InvalidURIImg />
          </center>
          <ErrorBlock error={this.props.stakePools.error} />
        </div>
      );
    }
    if (
      this.props.stakePools.pools === null ||
      this.props.pageInfo == null ||
      (this.props.stakePools.pools.length > 0 &&
        this.props.stakePools.pools[this.props.pageInfo.currentPage] == null)
    ) {
      return (
        <div className={width}>
          <Typography component="div" fontWeight="500" fontSize="18px" lineHeight="22px" marginBottom="16px">
            {intl.formatMessage(messages.title)}
          </Typography>
          <Skeleton
            variant="rectangular"
            width="100%"
            height="254px"
            animation="wave"
            sx={{
              backgroundColor: 'var(--yoroi-palette-gray-50)',
              borderRadius: '4px',
            }}
          />
        </div>
      );
    }
    const currPool = this.props.pageInfo.currentPage;
    if (this.props.stakePools.pools.length === 0 || isUnregistered) {
      return (
        <div className={width}>
          <InformativeError
            title={intl.formatMessage(emptyDashboardMessages.title, { ticker: this.props.ticker })}
            text={
              !isUnregistered
                ? // no need to explain to user how to delegate their ADA if they've done it before
                  null
                : intl.formatMessage(emptyDashboardMessages.text)
            }
          />
        </div>
      );
    }
    if (this.props.stakePools.pools[currPool] == null) {
      return (
        <div className={width}>
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </div>
      );
    }
    return <div className={width}>{this.props.stakePools.pools[currPool]}</div>;
  };
}
