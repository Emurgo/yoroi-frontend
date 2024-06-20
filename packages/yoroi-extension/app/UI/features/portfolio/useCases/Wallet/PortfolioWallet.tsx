import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import PortfolioHeader from '../../common/components/PortfolioHeader';
import WelcomeBanner from '../../common/components/WelcomeBanner';
import { useStrings } from '../../common/hooks/useStrings';
import { TokenType } from '../../common/types/index';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import StatsTable from './StatsTable';

const PortfolioWallet = (): JSX.Element => {
  const theme = useTheme();
  const strings = useStrings();
  const { walletBalance, assetList } = usePortfolio();

  const [keyword, setKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenList, setTokenList] = useState<TokenType[]>(assetList);
  const isShownWelcomeBanner: boolean = assetList.length === 1; // assumming only have ADA as default -> first time user

  console.log('assetList', assetList);

  useEffect(() => {
    if (isShownWelcomeBanner) return;

    // FAKE FETCHING DATA TO SEE SKELETON
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!keyword || isShownWelcomeBanner) {
      setTokenList(assetList);
      return;
    }

    const lowercaseKeyword = keyword.toLowerCase();

    const temp = assetList.filter(item => {
      return (
        item.name.toLowerCase().includes(lowercaseKeyword) ||
        item.id.toLowerCase().includes(lowercaseKeyword) ||
        item.overview.fingerprint.toLowerCase().includes(lowercaseKeyword)
      );
    });
    if (temp && temp.length > 0) {
      setTokenList(temp);
    } else {
      setTokenList([]);
    }
  }, [keyword]);

  return (
    <Stack direction="column" spacing={theme.spacing(3)} sx={{ minHeight: 'calc(100vh - 220px)' }}>
      <PortfolioHeader
        walletBalance={walletBalance}
        setKeyword={setKeyword}
        isLoading={isLoading}
        tooltipTitle={
          <>
            <Typography variant="body2" display={'block'}>
              % {strings.balancePerformance}
            </Typography>
            <Typography variant="body2" display={'block'}>
              +/- {strings.balanceChange}
            </Typography>
            <Typography variant="body2" display={'block'}>
              {strings.in24hours}
            </Typography>
          </>
        }
      />
      <StatsTable data={tokenList} isLoading={isLoading} />
      {isShownWelcomeBanner && <WelcomeBanner />}
    </Stack>
  );
};

export default PortfolioWallet;
