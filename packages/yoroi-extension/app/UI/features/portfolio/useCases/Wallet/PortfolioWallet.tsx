import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { ampli } from '../../../../../../ampli/index';
import PortfolioHeader from '../../common/components/PortfolioHeader';
import WelcomeBanner from '../../common/components/WelcomeBanner';
import { useStrings } from '../../common/hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import StatsTable from '../TokensTable/StatsTable';

const PortfolioWallet = ({ stores }): React.ReactNode => {
  const theme = useTheme();
  const strings = useStrings();
  const { walletBalance, ftAssetList, showWelcomeBanner, isTestnet } = usePortfolio();

  const [keyword, setKeyword] = useState<string>('');
  const [isLoading, _] = useState<boolean>(false);

  const tokenList = useMemo(() => {
    if (!keyword || showWelcomeBanner) {
      return ftAssetList;
    }

    const lowercaseKeyword = keyword.toLowerCase();
    const temp = ftAssetList.filter(item => {
      return (
        item.info.name.toLowerCase().includes(lowercaseKeyword) ||
        item.info.policyId.toLowerCase() === lowercaseKeyword ||
        item.info.fingerprint.toLowerCase() === lowercaseKeyword
      );
    });
    if (temp && temp.length > 0) {
      return temp;
    } else {
      return [];
    }
  }, [keyword, showWelcomeBanner, ftAssetList]);

  useEffect(() => {
    const lowercaseKeyword = keyword.toLowerCase();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const sendMetrics = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        ampli.portfolioTokensListSearchActivated({ search_term: lowercaseKeyword });
      }, 500); // 0.5s requirement
    };

    if (lowercaseKeyword.length > 0) sendMetrics();

    return () => clearTimeout(timeout);
  }, [keyword]);

  return (
    <Stack direction="column" spacing={theme.spacing(24)} sx={{ minHeight: 'calc(100vh - 220px)' }}>
      <PortfolioHeader
        stores={stores}
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
      <StatsTable data={tokenList} isLoading={isLoading} stores={stores} />
      {showWelcomeBanner && <WelcomeBanner isTestnet={isTestnet} />}
    </Stack>
  );
};

export default PortfolioWallet;
