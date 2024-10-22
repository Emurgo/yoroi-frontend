import { IconButton, styled } from '@mui/material';
import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useStrings } from '../../features/portfolio/common/hooks/useStrings';
import { Icon } from '../icons/index';
import { Tooltip } from '../Tooltip';

interface Props {
  textToCopy: string;
  disabled?: boolean;
}

const IconWrapper = styled(IconButton)(({ theme }: any) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

export const CopyButton = ({ textToCopy, disabled, ...props }: Props) => {
  const [copied, setCopied] = useState(false);
  const strings = useStrings();

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <CopyToClipboard text={textToCopy} onCopy={handleCopy} {...props}>
      <Tooltip title={copied ? strings.copied : strings.copyToClipboard} arrow placement="bottom-start">
        <IconWrapper disabled={disabled} sx={{ padding: 0 }}>
          {copied ? <Icon.Copied /> : <Icon.Copy />}
        </IconWrapper>
      </Tooltip>
    </CopyToClipboard>
  );
};
