// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, ResponsiveContainer } from 'recharts';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';

import styles from './GraphWrapper.scss';
import Card from './Card';
import globalMessages from '../../../../i18n/global-messages';

const messages = defineMessages({
  // total ADA sent to the pool
  tooltipEpoch: {
    id: 'wallet.dashboard.graph.tooltip.epoch',
    defaultMessage: '!!!Total ADA Sent',
  },
  epochAxisLabel: {
    id: 'wallet.dashboard.graph.epochAxisLabel',
    defaultMessage: '!!!Epoch ({epochLength} days)',
  },
  singleEpochAxisLabel: {
    id: 'wallet.dashboard.graph.singleEpochAxisLabel',
    defaultMessage: '!!!Epoch (1 day)',
  },
  dayToggleLabel: {
    id: 'wallet.dashboard.graph.dayToggleLabel',
    defaultMessage: '!!!Day (UTC)',
  }
});

export type GraphItems = {|
  +name: number,
  +primary: number,
|};

const GraphTabs: {|
  tabs: Array<string>,
  selected: number,
  setSelected: number => void,
|} => Node = ({ tabs, selected, setSelected, }) => {
  return (
    <ul className={styles.tabsWrapper}>
      {
        tabs.map(
          (tab, i) => (
            <li>
              <button
                type="button"
                onClick={() => setSelected(i)}
                onKeyPress={() => setSelected(i)}
                key={tab}
                className={i === selected
                  ? classnames(styles.tab, styles.tabActive)
                  : styles.tab
                }
              >
                {tab}
              </button>
            </li>
          )
        )
      }
    </ul>
  );
};

// const GraphToggles: {|
//   graphName: string,
//   dayLabel: string,
//   epochLabel: string,
// |} => Node = ({ graphName, dayLabel, epochLabel }) => {
//   return (
//     <div className={styles.radiosWrapper}>
//       <label htmlFor={graphName + '_day'} className={styles.checkboxLabel}>
//         <input
//           defaultChecked
//           type="radio"
//           id={graphName + '_day'}
//           name={graphName}
//           value="day"
//           className={styles.checkbox}
//         />
//         {dayLabel}
//       </label>
//       <label htmlFor={graphName + '_epoch'} className={styles.checkboxLabel}>
//         <input
//           type="radio"
//           id={graphName + '_epoch'}
//           name={graphName}
//           value="epoch"
//           className={styles.checkbox}
//         />
//         {epochLabel}
//       </label>
//     </div>
//   );
// };

const Graph: {|
  themeVars: Object,
  data: Array<GraphItems>,
  epochTitle: string,
  xAxisLabel: string,
  yAxisLabel: string,
  primaryBarLabel: string,
|} => Node = ({
  themeVars,
  data,
  epochTitle,
  xAxisLabel,
  yAxisLabel,
  primaryBarLabel,
}) => {

  const graphVars = {
    axisTickColor: themeVars['--theme-dashboard-graph-axis-tick-color'],
    axisTextColor: themeVars['--theme-dashboard-graph-axis-text-color'],
    legendTextColor: themeVars['--theme-dashboard-graph-legend-text-color'],
    legendIconSize: themeVars['--theme-dashboard-graph-legend-icon-size'],
    barWidth: themeVars['--theme-dashboard-graph-bar-width'],
    barHoverBgColor: themeVars['--theme-dashboard-graph-bar-hover-background-color'],
    barPrimaryColor: themeVars['--theme-dashboard-graph-bar-primary-color'],
    fontSize: themeVars['--theme-dashboard-graph-font-size'],
    lineHeight: themeVars['--theme-dashboard-graph-line-height'],
  };

  const formatLegend = (value) => (
    <span style={{ fontSize: graphVars.fontSize, color: graphVars.legendTextColor }}>
      {value}
    </span>
  );

  const GraphTooltip = (
    { active, payload, label }: {| active: boolean, payload: ?[any], label: string |}
  ) => {
    if (active && payload != null) {
      return (
        <div className={styles.tooltip}>
          <p>
            <span className={styles.tooltipLabel}>{epochTitle}:</span>&nbsp;
            <span className={styles.tooltipValue}>{label}</span>
          </p>
          <p>
            <span className={styles.tooltipLabel}>{primaryBarLabel}:</span>&nbsp;
            <span className={styles.tooltipValue}>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // $FlowFixMe props are passed implicitly which causes a flow error
  const graphTooltip = (<GraphTooltip />);
  return (
    <ResponsiveContainer width="100%" height={240}>
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
          dataKey="primary"
          stackId="a"
          fill={graphVars.barPrimaryColor}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

type Props = {|
  themeVars: Object,
  epochLength: ?number,
  tabs: Array<{|
    tabName: string,
    data: Array<GraphItems>,
    primaryBarLabel: string,
    yAxisLabel: string,
  |}>,
|};

type State = {|
  selectedTab: number,
|};

@observer
export default class GraphWrapper extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    selectedTab: 0,
  }

  _getEpochLengthLabel: void => string = () => {
    const { intl } = this.context;
    const { epochLength } = this.props;
    if (epochLength == null) {
      return intl.formatMessage(globalMessages.epochLabel);
    }

    return epochLength === 1
      ? intl.formatMessage(messages.singleEpochAxisLabel)
      : intl.formatMessage(messages.epochAxisLabel, { epochLength });
  }

  render() {
    const { intl } = this.context;
    const { tabs, themeVars } = this.props;

    return (
      <div className={styles.wrapper}>
        <GraphTabs
          tabs={tabs.map(tab => tab.tabName)}
          selected={this.state.selectedTab}
          setSelected={tab => this.setState({ selectedTab: tab })}
        />
        <Card>
          <div className={styles.graphContainer}>
            {/*
            <GraphToggles
              graphName={this.props.graphName}
              dayLabel={intl.formatMessage(messages.dayToggleLabel)}
              epochLabel={intl.formatMessage(globalMessages.epochLabel)}
            />
            */}
            <Graph
              epochTitle={intl.formatMessage(globalMessages.epochLabel)}
              xAxisLabel={this._getEpochLengthLabel()}
              yAxisLabel={tabs[this.state.selectedTab].yAxisLabel}
              primaryBarLabel={tabs[this.state.selectedTab].primaryBarLabel}
              themeVars={themeVars}
              data={tabs[this.state.selectedTab].data}
            />
          </div>
        </Card>
      </div>
    );
  }
}
