import React from 'react';
import { default as MuiTooltip, TooltipProps } from '@mui/material/Tooltip';
import { useTheme } from '@mui/material';

export const Tooltip = ({ children, ...props }: TooltipProps): JSX.Element => {
  const theme: any = useTheme();

  return (
    <MuiTooltip
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            color: theme.palette.ds.text_primary_on,
            bgcolor: theme.palette.ds.gray_c900,
            borderRadius: theme.spacing(0.5),
            padding: '5px 12px',
          },
        },
        arrow: {
          sx: { color: theme.palette.ds.gray_c900 },
        },
      }}
      {...props}
      sx={{
        ...props.sx,
      }}
    >
      {children}
    </MuiTooltip>
  );
};
