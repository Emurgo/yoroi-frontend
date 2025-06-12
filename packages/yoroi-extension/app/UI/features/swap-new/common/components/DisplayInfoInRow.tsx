import { Stack, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { CopyButton, Icons, IconWrapper, Tooltip } from '../../../../components';

type DisplayInfoInRowProps = {
  label: string;
  tooltip?: string | ReactNode;
  value: string | ReactNode;
  textToCopy?: string;
};

export const DisplayInfoInRow = ({ label, tooltip, value, textToCopy }: DisplayInfoInRowProps) => {
  const { atoms }: any = useTheme();
  return (
    <Stack direction="row" width="100%" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center">
        <Typography variant="body2" color="ds.el_gray_low" {...atoms.mr_xs}>
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} place="top">
            <IconWrapper icon={Icons.InfoCircle} color="ds.el_gray_low" />
          </Tooltip>
        )}
      </Stack>
      <Stack direction="row" alignItems="center" gap={4}>
        {typeof value === 'string' ? (
          <Typography variant="body2" color="ds.text_gray_max">
            {value}
          </Typography>
        ) : (
          value
        )}
        {textToCopy && <CopyButton textToCopy={textToCopy} />}
      </Stack>
    </Stack>
  );
};
