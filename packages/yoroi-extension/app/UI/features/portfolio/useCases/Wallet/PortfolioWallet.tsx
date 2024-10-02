import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import PortfolioHeader from '../../common/components/PortfolioHeader';
import WelcomeBanner from '../../common/components/WelcomeBanner';
import { useStrings } from '../../common/hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import StatsTable from '../TokensTable/StatsTable';

const PortfolioWallet = (): JSX.Element => {
  const theme = useTheme();
  const strings = useStrings();
  const { walletBalance, ftAssetList, showWelcomeBanner } = usePortfolio();

  const [keyword, setKeyword] = useState<string>('');
  const [isLoading, _] = useState<boolean>(false);
  const [tokenList, setTokenList] = useState(ftAssetList);

  useEffect(() => {
    // FAKE FETCHING DATA TO SEE SKELETON
    // setIsLoading(true);
    // const timer = setTimeout(() => {
    //   setIsLoading(false);
    // }, 2000);
    // return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!keyword || showWelcomeBanner) {
      setTokenList(ftAssetList);
      return;
    }

    const lowercaseKeyword = keyword.toLowerCase();

    const temp = ftAssetList.filter(item => {
      return (
        item.info.name.toLowerCase().includes(lowercaseKeyword) ||
        item.info.id.toLowerCase().includes(lowercaseKeyword) ||
        item.info.policyId.toLowerCase().includes(lowercaseKeyword)
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
        walletBalance={walletBalance || { ada: '0' }}
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
      {showWelcomeBanner && <WelcomeBanner />}
    </Stack>
  );
};

export default PortfolioWallet;
