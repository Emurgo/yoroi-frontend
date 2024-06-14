import React, { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useStrings } from '../hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { Icon } from '../../../../components/icons';
import { SearchInput, Tooltip, Chip, Skeleton } from '../../../../components';
import { BalanceType } from '../types/index';
import { ChipTypes } from '../../../../components/Chip';
import { formatNumber } from '../helpers/formatHelper';

interface Props {
  balance: BalanceType;
  setKeyword: (keyword: string) => void;
  isLoading: boolean;
  tooltipTitle: JSX.Element;
}

const PortfolioHeader = ({ balance, setKeyword, isLoading, tooltipTitle }: Props): JSX.Element => {
  const strings = useStrings();
  const theme: any = useTheme();
  const { unitOfAccount, settingFiatPairUnit, changeUnitOfAccount } = usePortfolio();
  const [isAdaMainUnit, setIsAdaMainUnit] = useState(unitOfAccount === 'ADA');

  const handleCurrencyChange = () => {
    if (isAdaMainUnit) {
      changeUnitOfAccount(settingFiatPairUnit.currency || 'USD');
      setIsAdaMainUnit(false);
    } else {
      changeUnitOfAccount('ADA');
      setIsAdaMainUnit(true);
    }
  };

  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack direction="column">
        <Stack direction="row" spacing={theme.spacing(0.5)} alignItems="flex-end">
          {isLoading ? (
            <Skeleton width="146px" height="24px" />
          ) : (
            <Typography variant="h2" fontWeight="500" color="ds.gray_cmax">
              {isAdaMainUnit ? formatNumber(balance.ada) : formatNumber(balance.usd)}
            </Typography>
          )}
          <Typography variant="body2" fontWeight="500" color="ds.black_static">
            {isAdaMainUnit ? settingFiatPairUnit.currency || 'USD' : 'ADA'}
            <Typography
              component="span"
              variant="body2"
              fontWeight="500"
              color="ds.text_gray_low"
              onClick={handleCurrencyChange}
              sx={{
                cursor: 'pointer',
                display: 'inline',
                marginTop: '5px',
              }}
            >
              {isAdaMainUnit ? '/ADA' : `/${unitOfAccount}`}
            </Typography>
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {isLoading ? (
            <Skeleton width="129px" height="16px" />
          ) : (
            <Typography color="ds.gray_c600">
              {isAdaMainUnit ? formatNumber(balance.usd) : formatNumber(balance.ada)} {isAdaMainUnit ? 'ADA' : unitOfAccount}
            </Typography>
          )}
          {isLoading ? (
            <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
              <Skeleton width="47px" height="20px" />
              <Skeleton width="65px" height="20px" />
            </Stack>
          ) : (
            <Tooltip title={tooltipTitle} placement="right" sx={{ width: '182px', height: '76px' }}>
              <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
                <Chip
                  type={balance.percents > 0 ? ChipTypes.ACTIVE : balance.percents < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {balance.percents > 0 ? (
                        <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                      ) : balance.percents < 0 ? (
                        <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                      ) : null}
                      {/* @ts-ignore */}
                      <Typography variant="caption1">
                        {balance.percents >= 0 ? formatNumber(balance.percents) : formatNumber(-1 * balance.percents)}%
                      </Typography>
                    </Stack>
                  }
                />
                <Chip
                  type={balance.amount > 0 ? ChipTypes.ACTIVE : balance.amount < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
                  label={
                    // @ts-ignore
                    <Typography variant="caption1">
                      {balance.amount > 0 && '+'}
                      {formatNumber(balance.amount)} USD
                    </Typography>
                  }
                />
              </Stack>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <SearchInput onChange={e => setKeyword(e.target.value)} placeholder={strings.search} />
    </Stack>
  );
};

export default PortfolioHeader;
