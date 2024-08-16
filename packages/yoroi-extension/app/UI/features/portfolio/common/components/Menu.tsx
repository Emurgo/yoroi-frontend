import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import React from 'react';
import { SubMenuOption } from '../types';

interface Props {
  options: SubMenuOption[];
  onItemClick: (route: string) => void;
  isActiveItem: (route: string) => boolean;
}

const Menu = ({ options, onItemClick, isActiveItem }: Props) => {
  const theme: any = useTheme();

  return (
    <Stack direction="row" spacing={theme.spacing(3)} sx={{ height: '3rem', paddingX: theme.spacing(3) }}>
      {options.map((option, index) => (
        <Box
          key={index}
          onClick={() => onItemClick(option.route)}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: '3px solid',
            borderColor: isActiveItem(option.route) ? 'ds.primary_500' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <Typography
            variant="body1"
            fontWeight="500"
            sx={{ color: isActiveItem(option.route) ? theme.palette.ds.primary_500 : theme.palette.ds.text_gray_low }}
          >
            {option.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default Menu;
