import { Typography, Stack, Box, Input, InputAdornment, styled } from '@mui/material';
import { ReactComponent as Search } from '../../../../../assets/images/assets-page/search.inline.svg';
import React, { useState } from 'react';
import { Tooltip, SearchInput } from '../../../../components';
import { useTheme } from '@mui/material/styles';
import { defineMessages } from 'react-intl';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import StatsTable from './StatsTable';
import mockData from '../../../../pages/portfolio/mockData';
import ArrowIcon from '../../common/assets/icons/Arrow';
import {Chip} from '../../common/chip';

const PortfolioWallet = ({ data }) => {
  const theme = useTheme();
  const { strings } = usePortfolio();
  const [keyword, setKeyword] = useState('');

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column">
          <Stack direction="row" spacing={theme.spacing(0.5)}>
            <Typography variant="h2" fontWeight="500">
              {mockData.PortfolioPage.balance.ada}
            </Typography>
            <Typography variant="body2" fontWeight="500" sx={{ marginTop: '5px' }}>
              ADA
              <Typography
                variant="body2"
                fontWeight="500"
                sx={{
                  display: 'inline',
                  marginTop: '5px',
                  color: theme.palette.ds.text_gray_low,
                }}
              >
                /USD
              </Typography>
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
              {mockData.PortfolioPage.balance.usd} USD
            </Typography>
            <Tooltip
              title={
                <>
                  <Typography display={'block'}>% {strings.balancePerformance}</Typography>
                  <Typography display={'block'}>+/- {strings.balanceChange}</Typography>
                  <Typography display={'block'}>{strings.in24hours}</Typography>
                </>
              }
              placement="right"
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                sx={{ marginLeft: theme.spacing(2) }}
              >
                <Chip
                  active={mockData.PortfolioPage.balance.percents.active}
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <ArrowIcon
                        fill={
                          mockData.PortfolioPage.balance.percents.active
                            ? theme.palette.ds.secondary_c800
                            : theme.palette.ds.sys_magenta_c700
                        }
                        style={{
                          marginRight: theme.spacing(0.5),
                          transform: mockData.PortfolioPage.balance.percents.active
                            ? ''
                            : 'rotate(180deg)',
                        }}
                      />
                      <Typography variant="caption1">
                        {mockData.PortfolioPage.balance.percents.value}%
                      </Typography>
                    </Stack>
                  }
                />
                <Chip
                  active={mockData.PortfolioPage.balance.amount.active}
                  label={
                    <Typography variant="caption1">
                      {mockData.PortfolioPage.balance.amount.active ? '+' : '-'}
                      {mockData.PortfolioPage.balance.amount.value} USD
                    </Typography>
                  }
                />
              </Stack>
            </Tooltip>
          </Stack>
        </Stack>

        <SearchInput
          disableUnderline
          onChange={e => setKeyword(e.target.value)}
          placeholder={strings.search}
          startAdornment={
            <InputAdornment
              sx={{
                '> svg > use': {
                  fill: '#242838',
                },
              }}
              position="start"
            >
              <Search />
            </InputAdornment>
          }
        />
      </Stack>
      <StatsTable data={data} />
    </Box>
  );
};

export default PortfolioWallet;
