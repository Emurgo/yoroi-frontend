// @flow
import { Box } from '@mui/material';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import { Component } from 'react';
import styles from './NavBarTitle.scss';

type Props = {|
  +title: string,
|};

@observer
export default class NavBarTitle extends Component<Props> {
  render(): Node {
    const { title } = this.props;
    return (
      <Box id="navBarTitle" className={styles.titleRevamp} sx={{ color: 'ds.el_gray_medium' }}>
        {title}
      </Box>
    );
  }
}
