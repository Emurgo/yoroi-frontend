// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label, ResponsiveContainer } from 'recharts';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';

import styles from './GraphWrapper.scss';
import CardShadow from './CardShadow';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { readCssVar } from '../../../../styles/utils';
import { Skeleton } from '@mui/material';

const messages = defineMessages({
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
  +poolName: string,
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
            <li key={tab}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                onKeyPress={() => setSelected(i)}
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

export const Graph: {|
  data: Array<GraphItems>,
  epochTitle: string,
  stakepoolNameTitle: string,
  xAxisLabel: string,
  yAxisLabel: string,
  primaryBarLabel: string,
  hideYAxis: boolean,
|} => Node = ({
  data,
  epochTitle,
  stakepoolNameTitle,
  xAxisLabel,
  yAxisLabel,
  primaryBarLabel,
  hideYAxis,
}) => {

  const graphVars = {
    axisTickColor: readCssVar('--yoroi-dashboard-graph-axis-tick-color'),
    axisTextColor: readCssVar('--yoroi-dashboard-graph-axis-text-color'),
    barWidth: readCssVar('--yoroi-dashboard-graph-bar-width'),
    barHoverBgColor: readCssVar('--yoroi-dashboard-graph-bar-hover-background-color'),
    barPrimaryColor: readCssVar('--yoroi-dashboard-graph-bar-primary-color'),
    fontSize: '0.75rem',
    lineHeight: 14,
  };

  const formatYAxis = (value) => (
    !hideYAxis ? value : '∗∗∗ '
  );

  const GraphTooltip = (
    { active, payload, label }: {| active: boolean, payload: ?[any], label: string |}
  ) => {
    if (active && payload != null) {
      return (
        <div className={styles.tooltip}>
          <div>
            <span className={styles.tooltipLabel}>{epochTitle}:</span>&nbsp;
            <span className={styles.tooltipValue}>{label}</span>
          </div>
          <div>
            <span className={styles.tooltipLabel}>{primaryBarLabel}:</span>&nbsp;
            <span className={styles.tooltipValue}>{payload[0].value}</span>
          </div>
          <div>
            <span className={styles.tooltipLabel}>{stakepoolNameTitle}:</span>&nbsp;
            <span className={styles.tooltipValue}>{payload[0].payload.poolName}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // $FlowExpectedError[prop-missing] props are passed implicitly which causes a flow error
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
          tickFormatter={formatYAxis}
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
  epochLength: ?number,
  tabs: Array<{|
    tabName: string,
    data: Array<GraphItems>,
    primaryBarLabel: string,
    yAxisLabel: string,
    hideYAxis: boolean,
  |}>,
|};

type State = {|
  selectedTab: number,
|};

@observer
export default class GraphWrapper extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
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

  render(): Node {
    const { intl } = this.context;
    const { tabs } = this.props;

    return (
      <div className={styles.wrapper}>
        <GraphTabs
          tabs={tabs.map(tab => tab.tabName)}
          selected={this.state.selectedTab}
          setSelected={tab => this.setState({ selectedTab: tab })}
        />
        {
          tabs[this.state.selectedTab].data.length === 0 ? (
            <Skeleton
              variant='rectangular'
              width='100%'
              height='256px'
              animation='wave'
              sx={{
                backgroundColor: 'var(--yoroi-palette-gray-50)',
                borderRadius: '4px',
              }}
            />
          ) : (
            <CardShadow>
              <div className={styles.graphContainer}>
                {/* <GraphToggles
                    graphName={this.props.graphName}
                    dayLabel={intl.formatMessage(messages.dayToggleLabel)}
                    epochLabel={intl.formatMessage(globalMessages.epochLabel)}
                  /> */}
                <Graph
                  epochTitle={intl.formatMessage(globalMessages.epochLabel)}
                  stakepoolNameTitle={intl.formatMessage(globalMessages.stakepoolNameLabel)}
                  xAxisLabel={this._getEpochLengthLabel()}
                  yAxisLabel={tabs[this.state.selectedTab].yAxisLabel}
                  primaryBarLabel={tabs[this.state.selectedTab].primaryBarLabel}
                  data={tabs[this.state.selectedTab].data}
                  hideYAxis={tabs[this.state.selectedTab].hideYAxis}
                />
              </div>
            </CardShadow>
          )
        }
      </div>
    );
  }
}
