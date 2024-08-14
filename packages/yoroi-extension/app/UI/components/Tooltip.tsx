import React from 'react';
import { default as MuiTooltip, TooltipProps } from '@mui/material/Tooltip';
import { useTheme } from '@mui/material';

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
            color: theme.palette.ds.text_primary_on,
            bgcolor: theme.palette.ds.gray_900,
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
