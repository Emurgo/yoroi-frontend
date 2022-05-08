// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { ReactComponent as NoTransactionClassicSvg }  from '../../../assets/images/transaction/no-transactions-yet.classic.inline.svg';
import { ReactComponent as NoTransactionModernSvg }  from '../../../assets/images/transaction/no-transactions-yet.modern.inline.svg';
import { Box, Typography } from '@mui/material';

type Props = {|
  +label: string,
  +classicTheme: boolean,
|};

@observer
export default class WalletNoTransactionsRevamp extends Component<Props> {
  render(): Node {
    const { classicTheme } = this.props;
    const NoTransactionSvg = classicTheme ? NoTransactionClassicSvg : NoTransactionModernSvg;
    return (
      <Box
        sx={{
          marginTop: '2px',
          padding: '30px 0 20px',
          backgroundColor: 'var(--yoroi-palette-common-white)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            marginBottom: '24px',
            svg: {
              width: '161px',
              height: '115px',
            },
          }}
        >
          <NoTransactionSvg />
        </Box>
        <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
          {this.props.label}
        </Typography>
      </Box>
    );
  }
}
