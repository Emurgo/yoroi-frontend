import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { ReactComponent as CopyIcon } from '../../assets/images/copy.inline.svg';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { StyledTooltip } from './tooltip';

export const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000); // Reset tooltip after 2 seconds
  };

  return (
    <CopyToClipboard text={textToCopy} onCopy={handleCopy}>
      <StyledTooltip title={copied ? 'Copied' : 'Copy to clipboard'} arrow placement="bottom-start">
        <IconButton>
          <CopyIcon />
        </IconButton>
      </StyledTooltip>
    </CopyToClipboard>
  );
};
