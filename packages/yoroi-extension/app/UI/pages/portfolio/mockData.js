// ALL THE MOCK DATA FOR RENDERING UI

const mockData = {
  tokenList: [
    {
      name: 'Token name',
      id: 'Policy ID',
      price: 0.23,
      portfolioPercents: 75,
      '24h': -0.03,
      '1W': 0.83,
      '1M': 0.89,
      totalAmount: 281023,
      totalAmountUsd: 372561,
    },
    {
      name: 'AGIX',
      id: 'Agix',
      price: 0.79,
      portfolioPercents: 43.23,
      '24h': -0.03,
      '1W': -0.19,
      '1M': 0.07,
      totalAmount: 1019243,
      totalAmountUsd: 372561,
    },
    {
      name: 'DOGE',
      id: 'Doge',
      price: 0.86,
      portfolioPercents: 81.28,
      '24h': 0.43,
      '1W': -0.07,
      '1M': -0.07,
      totalAmount: 658291,
      totalAmountUsd: 372561,
    },
  ],

  PortfolioPage: {
    balance: {
      ada: '289869,04',
      usd: '940,64',
      percents: {
        active: true,
        value: '0,03',
      },
      amount: {
        active: true,
        value: '0,56',
      },
    },
  },

  PortfolioDetailPage: {
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
