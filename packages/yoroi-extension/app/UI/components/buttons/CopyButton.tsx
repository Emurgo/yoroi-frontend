import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useStrings } from '../../features/portfolio/common/hooks/useStrings';
import { Icons, IconWrapper } from '../icons/index';
import { Tooltip } from '../Tooltip';

interface Props {
  textToCopy: string;
  disabled?: boolean;
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
        <IconWrapper disabled={disabled} buttonProps={{ sx: { padding: 0 } }} icon={copied ? Icons.Copied : Icons.Copy} asButton />
      </Tooltip>
    </CopyToClipboard>
  );
};
