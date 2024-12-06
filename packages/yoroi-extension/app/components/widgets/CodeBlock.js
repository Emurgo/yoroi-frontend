// @flow
import { observer } from 'mobx-react';
import { Box } from '@mui/material';

type Props = {|
  code: string,
|};

const CodeBlock: any = observer(({ code }: Props) => {
  return (
    <Box
      sx={{
        backgroundColor: 'ds.bg_color_contrast_min',
        borderRadius: '8px',
        color: 'ds.text_gray_medium',
        padding: '16px',
        fontWeight: 400,
        lineHeight: '22px',
        maxHeight: '360px',
        overflowY: 'overlay',
        overflowX: 'hidden',
        wordBreak: 'break-word',
      }}
    >
      <code>{code}</code>
    </Box>
  );
});

export default CodeBlock;
