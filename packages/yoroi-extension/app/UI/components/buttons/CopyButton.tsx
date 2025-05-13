import React, { useRef, useState } from 'react';
import { Icons, IconWrapper } from '../icons/index';
import { Tooltip } from '../Tooltip';
import { useIntl } from '../../context/IntlProvider';
import { defineMessages } from 'react-intl';
import { Box } from '@mui/material';

export const messages = Object.freeze(
  defineMessages({
    copyToClipboard: {
      id: 'widgets.copyableaddress.addressCopyTooltipMessage',
      defaultMessage: '!!!Copy to clipboard',
    },
    copied: {
      id: 'widgets.copyableaddress.copied',
      defaultMessage: '!!!Copied',
    },
  })
);

interface Props {
  textToCopy: string;
  disabled?: boolean;
}

export const CopyButton = ({ textToCopy, disabled, ...props }: Props) => {
  const [copied, setCopied] = useState(false);
  const { intl } = useIntl();
  const strings = useRef({
    copyToClipboard: intl.formatMessage(messages.copyToClipboard),
    copied: intl.formatMessage(messages.copied),
  }).current;

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(textToCopy);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Box onClick={handleCopy} {...props}>
      <Tooltip title={copied ? strings.copied : strings.copyToClipboard} arrow placement="bottom-start">
        <IconWrapper
          disabled={disabled}
          buttonProps={{ sx: { padding: 0 } }}
          icon={copied ? Icons.Copied : Icons.Copy}
          asButton
        />
      </Tooltip>
    </Box>
  );
};
