import { Stack, Typography, useTheme } from '@mui/material';
import { Icons, IconWrapper, Tooltip } from '../../../../components';

type DisplayInfoInRowProps = {
  label: string;
  tooltip: string | React.ReactNode;
  value: string | React.ReactNode;
};

export const DisplayInfoInRow = ({ label, tooltip, value }: DisplayInfoInRowProps) => {
  const { atoms }: any = useTheme();
  return (
    <Stack direction="row" width="100%" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center">
        <Typography variant="body2" color="ds.el_gray_low" {...atoms.mr_xs}>
          {label}
        </Typography>
        <Tooltip title={tooltip} place="top">
          <IconWrapper icon={Icons.InfoCircle} color="ds.el_gray_low" />
        </Tooltip>
      </Stack>
      {typeof value === 'string' ? (
        <Typography variant="body2" color="ds.text_gray_max">
          {value}
        </Typography>
      ) : (
        value
      )}
    </Stack>
  );
};
