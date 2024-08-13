// @flow
import React from 'react';
import { observer } from 'mobx-react';
import styles from './CodeBlock.scss';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material';

type Props = {|
  code: string,
|};

const CodeBlock: any = observer(({ code }: Props) => {
  const { name } = useTheme();
  return (
    <Box
      className={styles.component}
      sx={{ background: name === 'light-theme' ? '#f4f4f4' : 'ds.bg_color_low', border: '1px solid #ddd' }}
    >
      <code>{code}</code>
    </Box>
  );
});

export default CodeBlock;
