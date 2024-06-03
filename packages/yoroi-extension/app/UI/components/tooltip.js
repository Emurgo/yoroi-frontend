import { styled } from '@mui/material';
import { default as MuiTooltip, TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  color: theme.palette.ds.text_primary_on,
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.ds.gray_c900,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.ds.gray_c900,
  },
}));

export const Tooltip = ({ children, ...props }) => {
  return <StyledTooltip {...props}>{children}</StyledTooltip>;
};
