// @flow
import { Component } from 'react';
import type { Node } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { readCssVar } from '../../../../styles/utils';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import type { GraphItems } from '../dashboard/GraphWrapper';

const graphVars = {
  barWidth: Number(readCssVar('--yoroi-dashboard-graph-bar-width')),
  fontSize: '14px',
  lineHeight: 16,
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

export default class RewardGraphClean extends Component<Props> {
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
              backgroundColor: '#242838',
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
              </p>
            )}
          </Box>
        );
      }
      return null;
    };

    // $FlowExpectedError[prop-missing] props are passed implicitly which causes a flow error
    const graphTooltip = <GraphTooltip />;
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.slice(-10)} height={200}>
          <XAxis
            tick={{
              fill: '#A7AFC0',
              fontSize: graphVars.fontSize,
              lineHeight: graphVars.lineHeight,
            }}
            dataKey="name"
            label={{
              value: xAxisLabel,
              position: 'insideBottom',
              fontSize: graphVars.fontSize,
              fill: '#A7AFC0',
              dy: 10
            }}
            padding={{ left: 24, right: 24 }}
            stroke="#A7AFC0"
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            padding={{ top: 12 }}
            tick={{
              fill: '#A7AFC0',
              fontSize: graphVars.fontSize,
              lineHeight: graphVars.lineHeight,
            }}
            stroke="#A7AFC0"
            tickLine={false}
            label={{
              value: yAxisLabel,
              position: 'inside',
              angle: -90,
              color: readCssVar('--yoroi-palette-gray-600'),
            }}
          />

          <Tooltip content={graphTooltip} cursor={false} />

          <Bar
            name={primaryBarLabel}
            maxBarSize={graphVars.barWidth}
            radius={[4, 4, 0, 0]}
            dataKey="primary"
            stackId="a"
            fill="#3154CB"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
