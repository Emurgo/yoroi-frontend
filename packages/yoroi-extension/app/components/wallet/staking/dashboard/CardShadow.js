// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';

import styles from './CardShadow.scss';
import { Box } from '@mui/material';

type Props = {|
  children?: Node,
  title?: string,
|};

@observer
export default class Card extends Component<Props> {
  static defaultProps: {| children: void, title: void |} = {
    children: undefined,
    title: undefined,
  };

  render(): Node {
    const { title, children } = this.props;
    return (
      <Box className={styles.wrapper} sx={{ backgroundColor: 'ds.bg_color_max' }}>
        {title !== undefined && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.inner}>{children}</div>
      </Box>
    );
  }
}
