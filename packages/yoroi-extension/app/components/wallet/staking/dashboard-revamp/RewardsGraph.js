// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { readCssVar } from '../../../../styles/utils';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import type { GraphItems } from '../dashboard/GraphWrapper';

const graphVars = {
  barWidth: Number(readCssVar('--yoroi-dashboard-graph-bar-width')),
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
|};

export default class RewardGraph extends Component<Props> {
  render(): Node {
    const {
      hideYAxis,
      data,
      xAxisLabel,
      yAxisLabel,
      primaryBarLabel,
      epochTitle,
      stakepoolNameTitle,
    } = this.props;

    const formatYAxis = value => (!hideYAxis ? value : '∗∗∗ ');
    const GraphTooltip = ({
      active,
      payload,
      label,
    }: {|
      active: boolean,
      payload: ?[any],
      label: string,
    |}) => {
      if (active && payload != null) {
        const { poolName } = payload[0].payload;
        return (
          <Box
            sx={{
              padding: '8px 12px 8px 8px',
              backgroundColor: 'var(--yoroi-dashboard-graph-tooltip-background)',
              color: 'var(--yoroi-dashboard-graph-tooltip-text-color)',
              fontSize: '0.75rem',
              lineHeight: '14px',
              borderRadius: '4px',
            }}
          >
            <div>
              <span>{epochTitle}:</span>&nbsp;
              <span>{label}</span>
            </div>
            <div>
              <span>{primaryBarLabel}:</span>&nbsp;
              <span>{payload[0].value}</span>
            </div>
            {poolName && (
              <div>
                <span>{stakepoolNameTitle}:</span>&nbsp;
                <span>{payload[0].payload.poolName}</span>
              </div>
            )}
          </Box>
        );
      }
      return null;
    };

    // $FlowExpectedError[prop-missing] props are passed implicitly which causes a flow error
    const graphTooltip = <GraphTooltip />;
    return (
      <>
        <Typography component="div"
          variant="body1"
          color="var(--yoroi-palette-gray-600)"
          sx={{
            marginTop: '20px',
            marginBottom: '6px',
          }}
        >
          {yAxisLabel}
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            margin={{
              left: -25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              tick={{
                fill: '#A7AFC0',
                fontSize: graphVars.fontSize,
                lineHeight: graphVars.lineHeight,
              }}
              dataKey="name"
              height={50}
              label={{
                value: xAxisLabel,
                position: 'insideBottom',
                fontSize: graphVars.fontSize,
                fill: '#A7AFC0',
              }}
              stroke="#A7AFC0"
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{
                fill: '#A7AFC0',
                fontSize: graphVars.fontSize,
                lineHeight: graphVars.lineHeight,
              }}
              stroke="#A7AFC0"
              tickLine={false}
            />
            <Tooltip content={graphTooltip} cursor={{ fill: '#D9DDE0' }} />

            <Bar
              name={primaryBarLabel}
              maxBarSize={graphVars.barWidth}
              radius={[25, 25, 0, 0]}
              dataKey="primary"
              stackId="a"
              fill="#C4CAD7"
            />
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  }
}
