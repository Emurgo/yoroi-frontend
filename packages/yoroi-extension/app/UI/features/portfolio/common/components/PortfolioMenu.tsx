import React from 'react';
import { ROUTES } from '../../../../../routes-config';
import { useStrings } from '../hooks/useStrings';
import mockData from '../mockData';
import { SubMenuOption } from '../types';
import { Box, Stack, Typography, useTheme } from '@mui/material';

interface Props {
  onItemClick: (itemId: string) => void;
  isActiveItem: (itemId: string) => boolean;
}

const PortfolioMenu = ({ onItemClick, isActiveItem }: Props): JSX.Element => {
  const theme: any = useTheme();
  const strings = useStrings();

  const portfolioOptions: SubMenuOption[] = [
    {
      label: `${strings.menuWallet} (${mockData.wallet.tokenList.length})`,
      route: ROUTES.PORTFOLIO.ROOT,
      className: 'wallet',
    },
    {
      label: `${strings.menuDapps} (${mockData.dapps.liquidityList.length + mockData.dapps.orderList.length})`,
      route: ROUTES.PORTFOLIO.DAPPS,
      className: 'dapps',
    },
  ];

  return (
    <Stack direction="row" spacing={theme.spacing(3)} sx={{ height: '3rem', paddingX: theme.spacing(3) }}>
      {portfolioOptions.map(option => (
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

export default PortfolioMenu;
