// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Box } from '@mui/system';
import type { GraphItems } from '../dashboard/GraphWrapper';
import { Stack, Typography } from '@mui/material';

const graphVars = {
  barWidth: 10,
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
        const values = [
          [epochTitle, label],
          [primaryBarLabel, payload[0].value],
          poolName ? [stakepoolNameTitle, poolName] : [],
        ];
        return (
          <Box
            sx={{
              padding: '8px 12px 8px 8px',
              bgcolor: theme => theme.palette.grayscale[900],
              color: 'ds.white_static',
              lineHeight: '14px',
              borderRadius: '4px',
            }}
          >
            {values
              .filter(value => value !== null && value.length > 0)
              .map(([key, value], idx) => (
                <Stack direction="row" mb="2px">
                  <Typography
                    component="div"
                    width={idx === 2 ? '100px' : 'content'}
                    mr="3px"
                    variant="caption1"
                  >
                    {key}:
                  </Typography>
                  <Typography
                    component="div"
                    sx={{
                      wordWrap: 'break-word',
                      maxWidth: '300px',
                    }}
                    variant="caption1"
                    fontWeight="bold"
                  >
                    {value}
                  </Typography>
                </Stack>
              ))}
          </Box>
        );
      }
      return null;
    };

    // $FlowExpectedError[prop-missing] props are passed implicitly which causes a flow error
    const graphTooltip = <GraphTooltip />;
    return (
      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          data={data.slice(-10)}
          height={200}
          margin={{ top: 0, right: 0, left: 56, bottom: 0 }}
        >
          <XAxis
            tick={{
              fill: '#6B7384',
              fontSize: graphVars.fontSize,
              lineHeight: graphVars.lineHeight,
            }}
            dataKey="name"
            height={50}
            label={{
              value: xAxisLabel,
              position: 'insideBottom',
              fontSize: '12px',
              fill: '#6B7384',
              offset: 10,
            }}
            padding={{ left: 24, right: 24 }}
            stroke="#DCE0E9"
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            padding={{ top: 12 }}
            tick={{
              fill: '#6B7384',
              fontSize: graphVars.fontSize,
              lineHeight: graphVars.lineHeight,
            }}
            stroke="#DCE0E9"
            tickLine={false}
            label={{
              value: yAxisLabel,
              position: 'insideLeft',
              offset: 15,
              dy: 50,
              angle: -90,
              fill: '#6B7384',
              textAnchor: 'middle',
              fontSize: '12px',
              fontWeight: 400,
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
