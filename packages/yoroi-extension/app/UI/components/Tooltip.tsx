import React from 'react';
import { default as MuiTooltip, TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

export const Tooltip = ({ children, ...props }: TooltipProps): JSX.Element => {
  return (
    <MuiTooltip
      arrow
      classes={{ popper: props.className }}
      sx={(theme: any) => ({
        color: theme.palette.ds.text_primary_on,
        [`& .${tooltipClasses.arrow}`]: {
          color: theme.palette.ds.gray_c900,
        },
        [`& .${tooltipClasses.tooltip}`]: {
          backgroundColor: theme.palette.ds.gray_c900,
        },
        ...props.sx,
      })}
      {...props}
    >
      {children}
    </MuiTooltip>
  );
};
