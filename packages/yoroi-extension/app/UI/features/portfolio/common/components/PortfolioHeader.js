// @flow
import { ReactNode, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useStrings } from '../hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { Icon } from '../../../../components/icons';
import { SearchInput, Tooltip, Chip, Skeleton } from '../../../../components';
import { BalanceType } from '../types/index';

interface Props {
  balance: BalanceType;
  setKeyword: (keyword: string) => void;
  isLoading: boolean;
  tooltipTitle: ReactNode;
}

const PortfolioHeader = ({ balance, setKeyword, isLoading, tooltipTitle }: Props): ReactNode => {
  const strings = useStrings();
  const theme = useTheme();
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
              {isAdaMainUnit ? balance.ada : balance.usd}
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
              {isAdaMainUnit ? balance.usd : balance.ada} {isAdaMainUnit ? 'ADA' : unitOfAccount}
            </Typography>
          )}
          {isLoading ? (
            <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
              <Skeleton width="47px" height="20px" />
              <Skeleton width="65px" height="20px" />
            </Stack>
          ) : (
            <Tooltip title={tooltipTitle} placement="right">
              <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
                <Chip
                  active={balance.percents >= 0}
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {balance.percents >= 0 ? (
                        <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                      ) : (
                        <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                      )}

                      <Typography variant="caption1">
                        {balance.percents >= 0 ? balance.percents : -1 * balance.percents}%
                      </Typography>
                    </Stack>
                  }
                />
                <Chip
                  active={balance.amount >= 0}
                  label={
                    <Typography variant="caption1">
                      {balance.amount >= 0 && '+'}
                      {balance.amount} USD
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
