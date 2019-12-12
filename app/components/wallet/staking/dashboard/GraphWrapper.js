// @flow
import React, { Component } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, ResponsiveContainer } from 'recharts';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';

import styles from './GraphWrapper.scss';
import Card from './Card';
import globalMessages from '../../../../i18n/global-messages';

const messages = defineMessages({
  tooltipEpoch: {
    id: 'wallet.dashboard.graph.tooltip.epoch',
    defaultMessage: '!!!Total ADA Sent',
  },
  epochAxisLabel: {
    id: 'wallet.dashboard.graph.epochAxisLabel',
    defaultMessage: '!!!Epoch (5 days)',
  },
  dayToggleLabel: {
    id: 'wallet.dashboard.graph.dayToggleLabel',
    defaultMessage: '!!!Day (UTC)',
  }
});

const GraphTabs = ({ tabs }) => {
  return (
    <ul className={styles.tabsWrapper}>
      {
        tabs.map(
          (tab, i) => (
            <li
              key={tab}
              // TODO: Change to real isActive? condition for current tab
              className={i === 0 ? classnames(styles.tab, styles.tabActive) : styles.tab}
            >
              {tab}
            </li>
          )
        )
      }
    </ul>
  );
};

const GraphToggles = ({ graphName, dayLabel, epochLabel }) => {
  return (
    <div className={styles.radiosWrapper}>
      <label htmlFor={graphName + '_day'} className={styles.checkboxLabel}>
        <input type="radio" id={graphName + '_day'} name={graphName} value="day" defaultChecked className={styles.checkbox} />
        {dayLabel}
      </label>
      <label htmlFor={graphName + '_epoch'} className={styles.checkboxLabel}>
        <input type="radio" id={graphName + '_epoch'} name={graphName} value="epoch" className={styles.checkbox} />
        {epochLabel}
      </label>
    </div>
  );
};

const Graph = ({
  themeVars,
  data,
  epochTitle,
  totalAdaTitle,
  xAxisLabel,
  yAxisLabel,
  primaryBarLabel,
  secondaryBarLabel,
}) => {

  const graphVars = {
    axisTickColor: themeVars['--theme-dashboard-graph-axis-tick-color'],
    axisTextColor: themeVars['--theme-dashboard-graph-axis-text-color'],
    legendTextColor: themeVars['--theme-dashboard-graph-legend-text-color'],
    legendIconSize: themeVars['--theme-dashboard-graph-legend-icon-size'],
    barWidth: themeVars['--theme-dashboard-graph-bar-width'],
    barHoverBgColor: themeVars['--theme-dashboard-graph-bar-hover-background-color'],
    barPrimaryColor: themeVars['--theme-dashboard-graph-bar-primary-color'],
    barSecondaryColor: themeVars['--theme-dashboard-graph-bar-secondary-color'],
    fontSize: themeVars['--theme-dashboard-graph-font-size'],
    lineHeight: themeVars['--theme-dashboard-graph-line-height'],
  };

  const formatLegend = (value) => (
    <span style={{ fontSize: graphVars.fontSize, color: graphVars.legendTextColor }}>
      {value}
    </span>
  );

  const GraphTooltip = (
    { active, payload, label }: {| active: boolean, payload: Array<any>, label: string |}
  ) => {
    if (active) {
      return (
        <div className={styles.tooltip}>
          <p>
            <span className={styles.tooltipLabel}>{epochTitle}:</span>&nbsp;
            <span className={styles.tooltipValue}>{label}</span>
          </p>
          <p>
            <span className={styles.tooltipLabel}>{totalAdaTitle}:</span>&nbsp;
            <span className={styles.tooltipValue}>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // $FlowFixMe promps are passed implicitly which causes a flow error
  const graphTooltip = (<GraphTooltip />);
  return (
    <ResponsiveContainer height={240}>
      <BarChart
        data={data}
        margin={{ top: 20,
          right: 0,
          left: 40,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          tick={{
            fill: graphVars.axisTickColor,
            fontSize: graphVars.fontSize,
            lineHeight: graphVars.lineHeight
          }}
          dataKey="name"
          height={50}
          label={{
            value: xAxisLabel,
            position: 'insideBottom',
            fontSize: graphVars.fontSize,
            fill: graphVars.axisTextColor
          }}
        />
        <YAxis
          tick={{
            fill: graphVars.axisTickColor,
            fontSize: graphVars.fontSize,
            lineHeight: graphVars.lineHeight
          }}
        >
          <Label
            value={yAxisLabel}
            position="insideLeft"
            angle={-90}
            offset={-5}
            style={{ textAnchor: 'middle', fontSize: graphVars.fontSize, fill: graphVars.axisTextColor }}
          />
        </YAxis>
        <Tooltip
          content={graphTooltip}
          cursor={{ fill: graphVars.barHoverBgColor }}
        />
        <Legend
          formatter={formatLegend}
          align="left"
          iconSize={graphVars.legendIconSize}
          iconType="square"
          wrapperStyle={{
            position: 'absolute',
            left: '100px',
            bottom: '18px',
            width: 'auto'
          }}
        />
        <Bar
          name={primaryBarLabel}
          maxBarSize={graphVars.barWidth}
          dataKey="rewards"
          stackId="a"
          fill={graphVars.barPrimaryColor}
        />
        <Bar
          name={secondaryBarLabel}
          radius={[6, 6, 0, 0]}
          maxBarSize={graphVars.barWidth}
          dataKey="ada"
          stackId="a"
          fill={graphVars.barSecondaryColor}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

type Props = {|
  themeVars: Object,
  tabs: Array<string>,
  graphName: string,
  data: Array<Object>,
|};

@observer
export default class GraphWrapper extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { tabs, graphName, data, themeVars } = this.props;
    return (
      <div className={styles.wrapper}>
        <GraphTabs tabs={tabs} />
        <Card>
          <div className={styles.graphContainer}>
            <GraphToggles
              graphName={graphName}
              dayLabel={intl.formatMessage(messages.dayToggleLabel)}
              epochLabel={intl.formatMessage(globalMessages.epochLabel)}
            />
            <Graph
              epochTitle={intl.formatMessage(globalMessages.epochLabel)}
              totalAdaTitle={intl.formatMessage(messages.tooltipEpoch)}
              xAxisLabel={intl.formatMessage(messages.epochAxisLabel)}
              yAxisLabel={intl.formatMessage(messages.tooltipEpoch)}
              primaryBarLabel={intl.formatMessage(globalMessages.totalAdaLabel)}
              secondaryBarLabel={intl.formatMessage(globalMessages.rewardsLabel)}
              themeVars={themeVars}
              data={data}
            />
          </div>
        </Card>
      </div>
    );
  }
}
