import { Box, Stack, Typography, styled } from '@mui/material';
import { Icon } from '../icons';

const IconWrapper = styled(Box)(({ theme }: any) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.sys_orange_500,
    },
  },
}));

export const Warning = ({ title, content }) => {
  return (
    <Stack direction="column" gap="8px" sx={{ backgroundColor: 'ds.sys_yellow_100', borderRadius: '8px', p: '12px' }}>
      <Stack direction="row" gap={1} alignItems="center">
        <IconWrapper>
          <Icon.Info />
        </IconWrapper>
        <Typography variant="body2" color="ds.sys_orange_500">
          {title}
        </Typography>
      </Stack>
      <Box>
        <Typography variant="body2">{content}</Typography>
      </Box>
    </Stack>
  );
};
