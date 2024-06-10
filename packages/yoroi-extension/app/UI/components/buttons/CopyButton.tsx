// @flow
import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip } from '../Tooltip';
import { useStrings } from '../../features/portfolio/common/hooks/useStrings';
import { Icon } from '../icons/index';

interface Props {
  textToCopy: string;
  disabled: boolean;
}

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
        <IconButton disabled={disabled} sx={{ padding: 0 }}>
          {copied ? <Icon.Copied /> : <Icon.Copy />}
        </IconButton>
      </Tooltip>
    </CopyToClipboard>
  );
};
