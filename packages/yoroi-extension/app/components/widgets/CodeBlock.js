// @flow
import { observer } from 'mobx-react';
import styles from './CodeBlock.scss';
import { Box, useTheme } from '@mui/material';

type Props = {|
  code: string,
|};

const CodeBlock: any = observer(({ code }: Props) => {
  const { name } = useTheme();
  return (
    <Box
      className={styles.component}
      sx={{ background: name === 'light-theme' ? '#f4f4f4' : 'ds.bg_color_min', border: '1px solid #ddd' }}
    >
      <code>{code}</code>
    </Box>
  );
});

export default CodeBlock;
