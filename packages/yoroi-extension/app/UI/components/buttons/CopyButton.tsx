import { useRef, useState } from 'react';
import { Icons, IconWrapper } from '../icons/index';
import { Tooltip } from '../Tooltip';
import type { PlacesType } from 'react-tooltip';
import { defineMessages, useIntl } from 'react-intl';
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
  pathTestId?: string;
  place?: PlacesType;
}

export const CopyButton = ({ textToCopy, disabled, pathTestId = '', place = 'bottom', ...props }: Props) => {
  const [copied, setCopied] = useState(false);
  const intl = useIntl();
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
    <Box onClick={handleCopy} {...props} id={`${pathTestId}-copy-button`}>
      <Tooltip title={copied ? strings.copied : strings.copyToClipboard} arrow place={place}>
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
