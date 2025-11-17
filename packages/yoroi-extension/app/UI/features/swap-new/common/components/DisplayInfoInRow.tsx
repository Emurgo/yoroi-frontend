import { Stack, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { CopyButton, Icons, IconWrapper, Tooltip } from '../../../../components';
import type { PlacesType } from 'react-tooltip';

type DisplayInfoInRowProps = {
  label: string;
  tooltip?: string | ReactNode;
  value: string | ReactNode;
  textToCopy?: string;
  tooltipPlace?: PlacesType;
};

export const DisplayInfoInRow = ({ label, tooltip, value, textToCopy, tooltipPlace = 'bottom' }: DisplayInfoInRowProps) => {
  const { atoms }: any = useTheme();
  return (
    <Stack direction="row" width="100%" justifyContent="space-between" alignItems="start">
      <Stack direction="row" alignItems="start">
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
        {textToCopy && <CopyButton textToCopy={textToCopy} place={tooltipPlace} />}
      </Stack>
    </Stack>
  );
};
