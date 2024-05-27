import { styled } from '@mui/material';
import { default as MuiTooltip, TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.ds.black_static,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.ds.black_static,
  },
}));

export const Tooltip = ({ children, ...props }) => {
  return <StyledTooltip {...props}>{children}</StyledTooltip>;
};
