import { Typography, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import StatsTable from './StatsTable';
import mockData from '../../common/mockData';
import PortfolioHeader from '../../common/components/PortfolioHeader';
import { useStrings } from '../../common/hooks/useStrings';
import { TokenType } from '../../common/types/index';
import WelcomeBanner from '../../common/components/WelcomeBanner';

interface Props {
  data: TokenType[];
}

const PortfolioWallet = ({ data }: Props): JSX.Element => {
  const theme = useTheme();
  const strings = useStrings();
  const [keyword, setKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenList, setTokenList] = useState(data);
  const isShownWelcomeBanner = data.length === 1; // assumming only have ADA as default -> first time user

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
      setTokenList(data);
      return;
    }

    const lowercaseKeyword = keyword.toLowerCase();

    const temp = data.filter(item => {
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
        balance={mockData.common.walletBalance}
        setKeyword={setKeyword}
        isLoading={isLoading}
        tooltipTitle={
          <>
            <Typography display={'block'}>% {strings.balancePerformance}</Typography>
            <Typography display={'block'}>+/- {strings.balanceChange}</Typography>
            <Typography display={'block'}>{strings.in24hours}</Typography>
          </>
        }
      />
      <StatsTable data={tokenList} isLoading={isLoading} />
      {isShownWelcomeBanner && <WelcomeBanner />}
    </Stack>
  );
};

export default PortfolioWallet;
