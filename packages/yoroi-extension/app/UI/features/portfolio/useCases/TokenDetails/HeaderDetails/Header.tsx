import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import React from 'react';
import { useCurrencyPairing } from '../../../../../context/CurrencyContext';
import { getTotalAmount } from '../../../../../utils/createCurrentWalletInfo';
import { HiddenAmount } from '../../../common/components/HiddenAmount';
import { DEFAULT_FIAT_PAIR } from '../../../common/helpers/constants';
import { useStrings } from '../../../common/hooks/useStrings';
import { usePortfolio } from '../../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../../module/PortfolioTokenActivityProvider';
import { bigNumberToBigInt } from '../../TokensTable/TableColumnsChip';

interface Props {
  tokenInfo: TokenInfoType;
  stores: any;
}

const HeaderSection = observer(
  ({ tokenInfo, stores }: Props): JSX.Element => {
    const theme: any = useTheme();
    const strings = useStrings();
    const { unitOfAccount, accountPair, primaryTokenInfo } = usePortfolio();
    const isPrimaryToken: boolean = tokenInfo.id === '-';

    // TODO refactor and remove this caluclation from here in the future - this should come from the main selected wallet context
    const { wallets, delegation } = stores;
    const selectedWallet /*: WalletState */ = wallets.selectedOrFail;
    const rewards = delegation.getRewardBalanceOrZero(selectedWallet);
    const balance = selectedWallet.balance;
    const totalBalanceAmount = getTotalAmount(balance, rewards);
    const defaultEntry = totalBalanceAmount?.getDefaultEntry();
    const primaryBalance = defaultEntry.amount.shiftedBy(-primaryTokenInfo.decimals);
    // End of total Ada balance calculation

    const tokenTotalAmount = isPrimaryToken ? Number(primaryBalance) : tokenInfo.formatedAmount;
    if (tokenInfo.quantity === null) {
      return <></>;
    }

    const {
      ptActivity: { close: ptPrice },
    } = useCurrencyPairing();

    const {
      tokenActivity: { data24h },
    } = usePortfolioTokenActivity();

    const totaPriceCalc = React.useMemo(() => {
      if (!isPrimaryToken && !isEmpty(data24h)) {
        const tokenPrice = data24h && data24h[tokenInfo.info.id][1]?.price?.close;
        const tokenQuantityAsBigInt = bigNumberToBigInt(new BigNumber(tokenInfo.quantity));
        const tokenDecimals = !isPrimaryToken && tokenInfo.info.numberOfDecimals;

        if (tokenPrice === undefined && !isPrimaryToken) {
          return '-';
        }

        const totaPrice = atomicBreakdown(tokenQuantityAsBigInt, tokenDecimals)
          .bn.times(tokenPrice ?? 1)
          .times(String(ptPrice))
          .toFormat(tokenDecimals);
        return totaPrice;
      }
      return 0;
    }, [data24h, ptPrice]);

    const ptValue = accountPair?.from.name === primaryTokenInfo.name ? accountPair?.to.value : accountPair?.from.value;

    return (
      <Stack direction="column" spacing={theme.spacing(2)} sx={{ padding: theme.spacing(3) }}>
        <Typography fontWeight="500" color="ds.gray_900" fontSize="18px">
          {strings.balance}
        </Typography>

        <Stack direction="column" spacing={theme.spacing(0.5)}>
          <Stack direction="row" spacing={theme.spacing(0.25)} alignItems="flex-start">
            <Typography variant="h2" fontWeight="500" color="ds.text_gray_medium">
              <HiddenAmount isHidden={stores.profile.shouldHideBalance}>{tokenTotalAmount}</HiddenAmount>
            </Typography>
            <Typography
              variant="body2"
              fontWeight="500"
              color="ds.text_gray_medium"
              sx={{
                paddingTop: `${theme.spacing(1.3)}`,
              }}
            >
              {tokenInfo.info.name}
            </Typography>
          </Stack>

          <Typography color="ds.gray_600">
            <HiddenAmount isHidden={stores.profile.shouldHideBalance}>{isPrimaryToken ? ptValue : totaPriceCalc}</HiddenAmount>
            <span>&nbsp;{isPrimaryToken && unitOfAccount === primaryTokenInfo.name ? DEFAULT_FIAT_PAIR : unitOfAccount}</span>
          </Typography>
        </Stack>
      </Stack>
    );
  }
);

export default HeaderSection;
