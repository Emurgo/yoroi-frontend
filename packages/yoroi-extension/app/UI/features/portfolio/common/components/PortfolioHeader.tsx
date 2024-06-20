import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { Chip, SearchInput, Skeleton, Tooltip } from '../../../../components';
import { ChipTypes } from '../../../../components/Chip';
import { Icon } from '../../../../components/icons';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { formatNumber } from '../helpers/formatHelper';
import { useStrings } from '../hooks/useStrings';
import { BalanceType } from '../types/index';

interface Props {
  walletBalance: BalanceType;
  setKeyword: (keyword: string) => void;
  isLoading: boolean;
  tooltipTitle: JSX.Element;
}

const PortfolioHeader = ({ walletBalance, setKeyword, isLoading, tooltipTitle }: Props): JSX.Element => {
  const strings = useStrings();
  const theme: any = useTheme();
  const { unitOfAccount } = usePortfolio();

  console.log('PortfolioHeader unitOfAccount', { unitOfAccount, walletBalance });

  const [pairUnit, setPairUnit] = useState<any>({
    from: { name: 'ADA', value: walletBalance.ada },
    to: { name: unitOfAccount, value: walletBalance.fiatAmount },
  });

  const handleCurrencyChange = () => {
    if (unitOfAccount !== pairUnit.from.name) {
      // changeUnitOfAccount(unitOfAccount);
      setPairUnit({
        from: { name: unitOfAccount, value: walletBalance.fiatAmount },
        to: { name: 'ADA', value: walletBalance.ada },
      });
    } else {
      // changeUnitOfAccount('ADA');
      setPairUnit({
        from: { name: 'ADA', value: walletBalance.ada },
        to: { name: unitOfAccount, value: walletBalance.fiatAmount },
      });
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
              {pairUnit.from.value}
            </Typography>
          )}
          <Typography variant="body2" fontWeight="500" color="ds.black_static">
            {pairUnit.from.name}
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
              /{pairUnit.to.name}
            </Typography>
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {isLoading ? (
            <Skeleton width="129px" height="16px" />
          ) : (
            <Typography color="ds.gray_c600">
              {pairUnit.to.value} {pairUnit.to.name}
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
                  type={
                    walletBalance.percents > 0
                      ? ChipTypes.ACTIVE
                      : walletBalance.percents < 0
                      ? ChipTypes.INACTIVE
                      : ChipTypes.DISABLED
                  }
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {walletBalance.percents > 0 ? (
                        <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                      ) : walletBalance.percents < 0 ? (
                        <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                      ) : null}
                      {/* @ts-ignore */}
                      <Typography variant="caption1">
                        {walletBalance.percents >= 0
                          ? formatNumber(walletBalance.percents)
                          : formatNumber(-1 * walletBalance.percents)}
                        %
                      </Typography>
                    </Stack>
                  }
                />
                <Chip
                  type={
                    walletBalance.amount > 0
                      ? ChipTypes.ACTIVE
                      : walletBalance.amount < 0
                      ? ChipTypes.INACTIVE
                      : ChipTypes.DISABLED
                  }
                  label={
                    // @ts-ignore
                    <Typography variant="caption1">
                      {walletBalance.amount > 0 && '+'}
                      {formatNumber(walletBalance.amount)} {unitOfAccount}
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
