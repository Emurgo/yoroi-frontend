// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';

type Props = {|
  +displayName: string,
  +id?: string,
  +amount?: string,
  nameOnly?: boolean | null,
|};

@observer
export default class TokenOptionRow extends Component<Props> {
  static defaultProps: {|
    id: void,
    amount: void,
    nameOnly: void,
  |} = {
    id: undefined,
    amount: undefined,
    nameOnly: undefined,
  };
  render(): Node {
    const notOnlyName = !this.props.nameOnly;
    return (
      <Box width="100%" id={this.props.displayName}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#242838',
            fontSize: '1rem',
          }}
        >
          <Typography component="div" sx={{ flex: 1 }}>{this.props.displayName}</Typography>
          {notOnlyName && <Typography component="div" flex={1}>{this.props.amount}</Typography>}
        </Box>
        <Box>
          {notOnlyName && (
            <Typography component="div"
              sx={{ color: '#6B7384', fontSize: '0.875rem', letterSpacing: 0, lineHeight: '22px' }}
            >
              {this.props.id}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }
}
