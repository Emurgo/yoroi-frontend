import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import React from 'react';

const Menu = ({ options, onItemClick, isActiveItem }) => {
  const theme: any = useTheme();

  return (
    <Stack direction="row" spacing={theme.spacing(3)} sx={{ height: '3rem', paddingX: theme.spacing(3) }}>
      {options.map(option => (
        <Box
          onClick={() => onItemClick(option.route)}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: '3px solid',
            borderColor: isActiveItem(option.route) ? 'ds.primary_c500' : 'transparent',
            '&:hover': {
              cursor: 'pointer',
            },
          }}
        >
          <Typography
            variant="body1"
            fontWeight="500"
            sx={{ color: isActiveItem(option.route) ? theme.palette.ds.primary_c500 : theme.palette.ds.text_gray_medium }}
          >
            {option.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default Menu;
