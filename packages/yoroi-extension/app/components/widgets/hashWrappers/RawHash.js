// @flow

import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import styles from './RawHash.scss';
import { Box } from '@mui/material';
import { Typography } from '@mui/material';

type Props = {|
  +children: ?Node,
  +light?: boolean,
  +primary?: boolean,
  +className?: string,
|};

@observer
export default class RawHash extends Component<Props> {
  static defaultProps: {|
    className: void,
    primary: boolean,
    light?: boolean,
  |} = {
    className: undefined,
    primary: false,
    light: undefined,
  };

  render(): Node {
    const addressClasses = classnames([styles.hash, this.props.className], {
      [styles.lightColor]: this.props.light === true,
      [styles.darkColor]: this.props.light === false,
    });
    return this.props.primary ? (
      <Box
        component="span"
        sx={{
          color: 'ds.text_gray_medium',
          '&:hover': {
            color: 'primary.600',
          },
          '&:active': {
            color: 'primary.700',
          },
          '&:focus': {
            color: 'primary.600',
          },
          '&:disabled': {
            color: 'primary.300',
          },
        }}
      >
        {this.props.children}
      </Box>
    ) : (
      <Typography color="ds.text_gray_low" varinat="body1" className={addressClasses}>
        {this.props.children}
      </Typography>
    );
  }
}
