// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './BorderedBox.scss';
import { Box } from '@mui/material';

type Props = {|
  +children?: Node,
|};

@observer
export default class BorderedBox extends Component<Props> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  render(): Node {
    const { children } = this.props;
    return <Box className={styles.component}>{children}</Box>;
  }
}
