// @flow

import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import styles from './RawHash.scss';
import { Box } from '@mui/material';

type Props = {|
  +children: ?Node,
  +light: boolean,
  +primary?: boolean,
  +className?: string,
|};

@observer
export default class RawHash extends Component<Props> {
  static defaultProps: {| className: void |} = {
    className: undefined,
    primary: false,
  };

  render(): Node {
    const addressClasses = classnames([
      styles.hash,
      this.props.light ? styles.lightColor : styles.darkColor,
      this.props.className,
    ]);
    return this.props.primary ? (
      <Box
        component="span"
        sx={{
          color: 'primary.500',
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
      <span className={addressClasses}>{this.props.children}</span>
    );
  }
}
