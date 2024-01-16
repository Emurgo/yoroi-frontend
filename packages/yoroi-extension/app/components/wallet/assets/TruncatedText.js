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
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <TruncatedText sx={{ width: '90%' }}>{children}</TruncatedText>

      <IconButton onClick={onCopy}>{isCopied ? <IconCopied /> : <IconCopy />}</IconButton>
    </Stack>
  );
}