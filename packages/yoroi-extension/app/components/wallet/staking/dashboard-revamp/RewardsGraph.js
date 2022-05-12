// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { readCssVar } from '../../../../styles/utils';
import { Box } from '@mui/system';

const graphVars = {
    axisTickColor: readCssVar('--yoroi-dashboard-graph-axis-tick-color'),
    axisTextColor: readCssVar('--yoroi-dashboard-graph-axis-text-color'),
    barWidth: readCssVar('--yoroi-dashboard-graph-bar-width'),
    barHoverBgColor: readCssVar('--yoroi-dashboard-graph-bar-hover-background-color'),
    barPrimaryColor: readCssVar('--yoroi-palette-gray-300'),
    fontSize: '0.75rem',
    lineHeight: 14,
};

type Props = {|
    data: Array<GraphItems>,
    epochTitle: string,
    stakepoolNameTitle: string,
    xAxisLabel: string,
    yAxisLabel: string,
    primaryBarLabel: string,
    hideYAxis: boolean,
|}

export default class RewardGraph extends Component<Props> {
    render(): Node {
      const {
          hideYAxis,
          data,
          xAxisLabel,
          yAxisLabel,
          primaryBarLabel,
          epochTitle,
          stakepoolNameTitle
      } = this.props;

      const formatYAxis = (value) => (
          !hideYAxis ? value : '∗∗∗ '
      );
      const GraphTooltip = (
          { active, payload, label }: {| active: boolean, payload: ?[any], label: string |}
      ) => {
          if (active && payload != null) {
            const { poolName } =  payload[0].payload
            return (
              <Box sx={{
                padding: '8px 12px 8px 8px',
                backgroundColor: 'var(--yoroi-dashboard-graph-tooltip-background)',
                color: 'var(--yoroi-dashboard-graph-tooltip-text-color)',
                fontSize: '0.75rem',
                lineHeight: '14px',
                borderRadius: '4px',
              }}
              >
                <p>
                  <span>{epochTitle}:</span>&nbsp;
                  <span>{label}</span>
                </p>
                <p>
                  <span>{primaryBarLabel}:</span>&nbsp;
                  <span>{payload[0].value}</span>
                </p>
                {poolName && (
                <p>
                  <span>{stakepoolNameTitle}:</span>&nbsp;
                  <span>{payload[0].payload.poolName}</span>
                </p>)}
              </Box>
            );
          }
          return null;
      };

      // $FlowExpectedError[prop-missing] props are passed implicitly which causes a flow error
      const graphTooltip = (<GraphTooltip />);
      return (
        <>
          <p>{yAxisLabel}</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
              margin={{
                left: -20
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
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{
                  fill: graphVars.axisTickColor,
                  fontSize: graphVars.fontSize,
                  lineHeight: graphVars.lineHeight
                }}
                tickLine={false}
              />
              <Tooltip
                content={graphTooltip}
                cursor={{ fill: graphVars.barHoverBgColor }}
              />

              <Bar
                name={primaryBarLabel}
                maxBarSize={graphVars.barWidth}
                dataKey="primary"
                stackId="a"
                fill="#C4CAD7"
              />
            </BarChart>
          </ResponsiveContainer>
        </>
      );
    }
};