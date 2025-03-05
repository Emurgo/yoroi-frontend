import { useTheme } from '@mui/material';
import { default as MuiTooltip, TooltipProps } from '@mui/material/Tooltip';
import React from 'react';

interface Props extends TooltipProps {
  children: JSX.Element;
  title: JSX.Element;
}

export const Tooltip = ({ children, title, ...props }: Props): JSX.Element => {
  const theme: any = useTheme();

  return (
    <MuiTooltip
      title={title}
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            color: theme.palette.ds.text_gray_medium,
            bgcolor: theme.palette.ds.bg_color_min,
            borderRadius: `${theme.shape.borderRadius / 2}px`,
            padding: '5px 12px',
          },
        },
        arrow: {
          sx: { color: theme.palette.ds.gray_900 },
        },
      }}
      {...props}
    >
      {children}
    </MuiTooltip>
  );
};
