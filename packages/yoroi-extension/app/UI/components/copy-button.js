import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import CopyIcon from '../components/icons/portfolio/Copy';
import CopiedIcon from '../components/icons/portfolio/Copied';
import { StyledTooltip } from './tooltip';

export const CopyButton = ({ textToCopy, disabled, ...props }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <CopyToClipboard text={textToCopy} onCopy={handleCopy} {...props}>
      <StyledTooltip title={copied ? 'Copied' : 'Copy to clipboard'} arrow placement="bottom-start">
        <IconButton disabled={disabled} sx={{ padding: 0 }}>
          {copied ? <CopiedIcon /> : <CopyIcon />}
        </IconButton>
      </StyledTooltip>
    </CopyToClipboard>
  );
};
