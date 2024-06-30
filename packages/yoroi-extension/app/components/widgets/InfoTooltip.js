// @flow

import { Box, Typography } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { ReactComponent as Info } from '../../assets/images/revamp/icons/info.inline.svg';

const STooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme, width }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.grayscale[900],
    opacity: 0.8,
    lineHeight: 18,
    fontSize: 14,
    maxWidth: width,
  },
}));

type Props = {|
  +content: string | React$Node,
  width?: number,
  children?: React$Node,
|};

export const InfoTooltip = ({ content, width, children }: Props): React$Node => {
  const contentNode =
    typeof content === 'string' ? <Typography color="inherit">{content}</Typography> : content;
  return (
    <STooltip title={contentNode} placement="top" arrow width={width}>
      <Box component="span" color="grayscale.900" sx={{ p: 0, m: 0, height: '24px' }}>
        {children ?? <Info />}
      </Box>
    </STooltip>
  );
};
