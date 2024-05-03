// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './CodeBlock.scss';
import { Box } from '@mui/material';

type Props = {|
  +code: string | Node,
|};

@observer
export default class CodeBlock extends Component<Props> {
  render(): Node {
    return (
      <Box sx={{bgcolor: "ds.gray_c100"}} className={styles.component}>
        <code>{this.props.code}</code>
      </Box>
    );
  }
}
