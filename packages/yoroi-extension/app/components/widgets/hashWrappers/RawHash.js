// @flow

import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import styles from './RawHash.scss';
import { Box } from '@mui/material';

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
          color: 'ds.primary_c500',
          '&:hover': {
            color: 'ds.primary_c600',
          },
          '&:active': {
            color: 'ds.primary_c700',
          },
          '&:focus': {
            color: 'ds.primary_c600',
          },
          '&:disabled': {
            color: 'ds.primary_c300',
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
