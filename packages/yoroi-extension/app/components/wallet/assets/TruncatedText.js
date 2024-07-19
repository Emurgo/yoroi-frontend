// @flow

// Requrie predefined with
// jone -> jo..
import type { Node } from 'react';
import { useState } from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import { ReactComponent as IconCopied } from '../../../assets/images/copied.inline.svg';
import { ReactComponent as IconCopy } from '../../../assets/images/copy.inline.svg';
import { styled } from '@mui/system';

export const TruncatedText: any = styled(Typography)({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export function CopyAddress({ text, children }: {| text: string, children: Node |}): Node {
  const [isCopied, setCopy] = useState(false);

  const onCopy = async () => {
    setCopy(false);

    try {
      await navigator.clipboard.writeText(text);
      setCopy(true);
    } catch (error) {
      setCopy(false);
    }

    setTimeout(() => {
      setCopy(false);
    }, 2500); // 2.5 sec
  };

  return (
    <Stack direction="row" alignItems="center">
      <TruncatedText>{children}</TruncatedText>
      <SButton onClick={onCopy}>{isCopied ? <IconCopied /> : <IconCopy />}</SButton>
    </Stack>
  );
}

const SButton = styled(IconButton)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_normal,
    },
  },
}));
