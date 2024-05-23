// ALL THE MOCK DATA FOR RENDERING UI

const mockData = {
  PortfolioPage: {
    headCells: [
      { id: 'name', label: 'Name', align: 'left' },
      { id: 'price', label: 'Price', align: 'left' },
      { id: '24h', label: '24H', align: 'left' },
      { id: '1w', label: '1W', align: 'left' },
      { id: '1m', label: '1M', align: 'left' },
      { id: 'portfolioPercents', label: 'Portfolio %', align: 'left' },
      { id: 'totalAmount', label: 'Total amount', align: 'right' },
    ],
    data: [
      {
        name: 'Token name',
        id: 'Policy ID',
        price: '0,48 USD',
        portfolioPercents: '75,00',
        '24h': {
          active: true,
          percents: '0,03%',
        },
        '1W': {
          active: false,
          percents: '0,07%',
        },
        '1M': {
          active: true,
          percents: '0,07%',
        },
        totalAmount: {
          amount: '1,019,243 ADA',
          usd: '372,561 USD',
        },
      },
      {
        name: 'AGIX',
        id: 'Agix',
        price: '0,08 USD',
        portfolioPercents: '5,00',
        '24h': {
          active: false,
          percents: '0,03%',
        },
        '1W': {
          active: false,
          percents: '0,07%',
        },
        '1M': {
          active: false,
          percents: '0,07%',
        },
        totalAmount: {
          amount: '4990,00 AGIX',
          usd: '400,00 USD',
        },
      },
      {
        name: 'MILK',
        id: 'Milk',
        price: '0,05 USD',
        portfolioPercents: '5,00',
        '24h': {
          active: true,
          percents: '0,03%',
        },
        '1W': {
          active: false,
          percents: '0,07%',
        },
        '1M': {
          active: true,
          percents: '0,03%',
        },
        totalAmount: {
          amount: '1000,00 MILK',
          usd: '372,561 USD',
        },
      },
      {
        name: 'TKN',
        id: 'Tkn',
        price: '0,08 USD',
        portfolioPercents: '5,00',
        '24h': {
          active: true,
          percents: '0,03%',
        },
        '1W': {
          active: true,
          percents: '0,07%',
        },
        '1M': {
          active: false,
          percents: '0,07%',
        },
        totalAmount: {
          amount: '4990,00 AGIX',
          usd: '400,00 USD',
        },
      },
      {
        name: 'TKN',
        id: 'Tkn',
        price: '0,08 USD',
        portfolioPercents: '5,00',
        '24h': {
          active: false,
          percents: '0,03%',
        },
        '1W': {
          active: true,
          percents: '0,07%',
        },
        '1M': {
          active: true,
          percents: '0,07%',
        },
        totalAmount: {
          amount: '4990,00 AGIX',
          usd: '400,00 USD',
        },
      },
      {
        name: 'TKN',
        id: 'Tkn',
        price: '0,08 USD',
        portfolioPercents: '5,00',
        '24h': {
          active: false,
          percents: '0,03%',
        },
        '1W': {
          active: false,
          percents: '0,07%',
        },
        '1M': {
          active: false,
          percents: '0,07%',
        },
        totalAmount: {
          amount: '4990,00 AGIX',
          usd: '400,00 USD',
        },
      },
    ],
  },
  PortfolioDetailPage: {
    subMenuOptions: [
      {
        label: 'Overview',
        className: 'overview',
        route: 'overview',
      },
      {
        label: 'Performance',
        className: 'performance',
        route: 'performance',
      },
    ],
    history: [
      {
        type: 'Sent',
        time: '11:30 PM',
        date: '05/23/2024',
        status: 'Low',
        fee: {
          amount: '0.17 ADA',
          usd: '0.03 USD',
        },
        amount: {
          total: '1,169,789.34432 ADA',
          usd: '0.03 USD',
          asset: '200 MILK',
        },
      },
      {
        type: 'Received',
        time: '9:12 PM',
        date: '05/23/2024',
        status: 'Low',
        amount: {
          total: '1,169,789.34432 ADA',
          usd: '312,323.33 USD',
          asset: 2,
        },
      },
      {
        type: 'Transaction error',
        time: '9:12 PM',
        date: '05/22/2024',
        status: 'Failed',
        amount: {
          total: '1,169,789.34432 ADA',
          usd: '312,323.33 USD',
          asset: 2,
        },
      },
      {
        type: 'Sent',
        time: '4:20 PM',
        date: '05/20/2024',
        status: 'Low',
        fee: {
          amount: '0.17 ADA',
          usd: '0.03 USD',
        },
        amount: {
          total: '1,169,789.34432 ADA',
          usd: '0.03 USD',
          asset: '200 MILK',
        },
      },
    ],
  },
  TokenDetails: {
    performanceItemList: [
      { id: 'tokenPriceChange', label: 'Token price change' },
      { id: 'tokenPrice', label: 'Token price' },
      { id: 'marketCap', label: 'Market cap' },
      { id: 'volumn', label: '24h volumn' },
      { id: 'rank', label: 'Rank' },
      { id: 'circulating', label: 'Circulating' },
      { id: 'totalSupply', label: 'Total supply' },
      { id: 'maxSupply', label: 'Max supply' },
      { id: 'allTimeHigh', label: 'All time high' },
      { id: 'allTimeLow', label: 'All time low' },
    ],
  },
  Chart: {
    data: [
      { name: 'Page A', value: 0.1 },
      { name: 'Page B', value: 0.15 },
      { name: 'Page C', value: 0.05 },
      { name: 'Page D', value: 0.35 },
      { name: 'Page E', value: 0.6 },
      { name: 'Page F', value: 0.45 },
      { name: 'Page G', value: 0.3 },
      { name: 'Page H', value: 0.2 },
      { name: 'Page I', value: 0.35 },
      { name: 'Page J', value: 0.55 },
    ],
  },
};

export default mockData;
