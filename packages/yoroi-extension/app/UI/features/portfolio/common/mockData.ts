import { createChartData, getRandomTime, start1WeekAgo, start24HoursAgo } from './helpers/mockHelper';
import { BalanceType, LiquidityItemType, OrderItemType, TokenType } from './types';
import { HistoryItemStatus, HistoryItemType, TransactionItemType } from './types/transaction';

// ALL THE MOCK DATA FOR RENDERING UI NEW
const mockData = {
  common: {
    walletBalance: {
      ada: 0.0, //((100000 * Math.random())),
      usd: 0.0, //((1000 * Math.random())),
      percents: 0.0, //(Math.random()),
      amount: 0.0, //(Math.random()),
    } as BalanceType,
    dappsBalance: {
      ada: 100000 * Math.random(),
      usd: 1000 * Math.random(),
      percents: Math.random(),
      amount: Math.random(),
    } as BalanceType,
  },

  wallet: {
    tokenList: [
      {
        name: 'ADA',
        id: 'Cardano',
        price: 0.48,
        portfolioPercents: 0.0,
        '24h': -(10 * Math.random()),
        '1W': 10 * Math.random(),
        '1M': 10 * Math.random(),
        totalAmount: 0.0,
        totalAmountUsd: 0.0,
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset311q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj6789',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 1000 * Math.random() },
          { value: 1000 * Math.random() },
          { value: null },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
      {
        name: 'DOGE',
        id: 'Doge',
        price: 10 * Math.random(),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()),
        '1W': 10 * Math.random(),
        '1M': -(10 * Math.random()),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset322q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj3456',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: null },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 100 * Math.random() },
          { value: 1000 * Math.random() },
          { value: null },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
      {
        name: 'AGIX',
        id: 'Agix',
        price: 10 * Math.random(),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': 10 * Math.random(),
        '1W': -(10 * Math.random()),
        '1M': 10 * Math.random(),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset333q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 100 * Math.random() },
          { value: 1000 * Math.random() },
          { value: '45B' },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
      {
        name: 'Shiba',
        id: 'shiba',
        price: 10 * Math.random(),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()),
        '1W': -(10 * Math.random()),
        '1M': 10 * Math.random(),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset344q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj3456',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 100 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
      {
        name: 'ALT',
        id: 'alt',
        price: 10 * Math.random(),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()),
        '1W': 10 * Math.random(),
        '1M': -(10 * Math.random()),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset355q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj3456',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 100 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
      {
        name: 'TKN1',
        id: 'Tkn1',
        price: 10 * Math.random(),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': 10 * Math.random(),
        '1W': 10 * Math.random(),
        '1M': 10 * Math.random(),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset366q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj3456',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 100 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
      {
        name: 'TKN2',
        id: 'Tkn2',
        price: 10 * Math.random(),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()),
        '1W': -(10 * Math.random()),
        '1M': -(10 * Math.random()),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset377q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj3456',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 100 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
      {
        name: 'TKN3',
        id: 'Tkn3',
        price: 10 * Math.random(),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()),
        '1W': 10 * Math.random(),
        '1M': -(10 * Math.random()),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset388q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj3456',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 100 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
      {
        name: 'TKN6',
        id: 'Tkn6',
        price: 10 * Math.random(),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': 10 * Math.random(),
        '1W': 10 * Math.random(),
        '1M': 10 * Math.random(),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj3456',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 100 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
      {
        name: 'TKN8',
        id: 'Tkn8',
        price: 10 * Math.random(),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': 10 * Math.random(),
        '1W': 10 * Math.random(),
        '1M': -(10 * Math.random()),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset400q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj3456',
        },
        performance: [
          { value: Math.random() },
          { value: Math.random() },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: 100 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 1000 * Math.random() },
          { value: 10 * Math.random() },
          { value: Math.random() / 100 },
        ],
        chartData: {
          start24HoursAgo: createChartData('24H'),
          start1WeekAgo: createChartData('1W'),
          start1MonthAgo: createChartData('1M'),
          start6MonthAgo: createChartData('6M'),
          start1YearAgo: createChartData('1Y'),
          ALL: createChartData('1Y'),
        },
      },
    ] as TokenType[],
  },

  dapps: {
    liquidityList: [
      {
        id: Math.random(),
        tokenPair: 'ADA/HOSKY',
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        firstToken: {
          name: 'ADA',
          id: 'ada',
        },
        secondToken: {
          name: 'HOSKY',
          id: 'hosky',
        },
        lpTokens: Math.random() * 1000000,
        totalValue: Math.random() * 1000,
        totalValueUsd: Math.random() * 100,
        firstTokenValue: Math.random() * 100,
        firstTokenValueUsd: Math.random() * 100,
        secondTokenValue: Math.random() * 10000,
        secondTokenValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        tokenPair: 'DOGE/Shiba',
        DEX: 'Sundaeswap',
        DEXLink: 'https://v2.sundaeswap.finance/',
        firstToken: {
          name: 'DOGE',
          id: 'doge',
        },
        secondToken: {
          name: 'Shiba',
          id: 'shiba',
        },
        lpTokens: Math.random() * 1000000,
        totalValue: Math.random() * 1000,
        totalValueUsd: Math.random() * 100,
        firstTokenValue: Math.random() * 100,
        firstTokenValueUsd: Math.random() * 100,
        secondTokenValue: Math.random() * 10000,
        secondTokenValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        tokenPair: 'DBZ/ADA',
        DEX: 'Sundaeswap',
        DEXLink: 'https://v2.sundaeswap.finance/',
        firstToken: {
          name: 'DBZ',
          id: 'dbz',
        },
        secondToken: {
          name: 'ADA',
          id: 'ada',
        },
        lpTokens: Math.random() * 1000000,
        totalValue: Math.random() * 1000,
        totalValueUsd: Math.random() * 100,
        firstTokenValue: Math.random() * 100,
        firstTokenValueUsd: Math.random() * 100,
        secondTokenValue: Math.random() * 10000,
        secondTokenValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        tokenPair: 'ADA/BRICKS',
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        firstToken: {
          name: 'ADA',
          id: 'ada',
        },
        secondToken: {
          name: 'BRICKS',
          id: 'bricks',
        },
        lpTokens: Math.random() * 1000000,
        totalValue: Math.random() * 1000,
        totalValueUsd: Math.random() * 100,
        firstTokenValue: Math.random() * 100,
        firstTokenValueUsd: Math.random() * 100,
        secondTokenValue: Math.random() * 10000,
        secondTokenValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        tokenPair: 'ADA/POPPA',
        DEX: 'Sundaeswap',
        DEXLink: 'https://v2.sundaeswap.finance/',
        firstToken: {
          name: 'ADA',
          id: 'ada',
        },
        secondToken: {
          name: 'POPPA',
          id: 'poppa',
        },
        lpTokens: Math.random() * 1000000,
        totalValue: Math.random() * 1000,
        totalValueUsd: Math.random() * 100,
        firstTokenValue: Math.random() * 100,
        firstTokenValueUsd: Math.random() * 100,
        secondTokenValue: Math.random() * 10000,
        secondTokenValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        tokenPair: 'CUBY/VALDO',
        DEX: 'Sundaeswap',
        DEXLink: 'https://v2.sundaeswap.finance/',
        firstToken: {
          name: 'CUBY',
          id: 'cuby',
        },
        secondToken: {
          name: 'VALDO',
          id: 'valdo',
        },
        lpTokens: Math.random() * 1000000,
        totalValue: Math.random() * 1000,
        totalValueUsd: Math.random() * 100,
        firstTokenValue: Math.random() * 100,
        firstTokenValueUsd: Math.random() * 100,
        secondTokenValue: Math.random() * 10000,
        secondTokenValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        tokenPair: 'SNEK/USDTST',
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        firstToken: {
          name: 'SNEK',
          id: 'snek',
        },
        secondToken: {
          name: 'USDTST',
          id: 'usdtst',
        },
        lpTokens: Math.random() * 1000000,
        totalValue: Math.random() * 1000,
        totalValueUsd: Math.random() * 100,
        firstTokenValue: Math.random() * 100,
        firstTokenValueUsd: Math.random() * 100,
        secondTokenValue: Math.random() * 10000,
        secondTokenValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        tokenPair: 'GERO/NMKR',
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        firstToken: {
          name: 'GERO',
          id: 'gero',
        },
        secondToken: {
          name: 'NMKR',
          id: 'nmkr',
        },
        lpTokens: Math.random() * 1000000,
        totalValue: Math.random() * 1000,
        totalValueUsd: Math.random() * 100,
        firstTokenValue: Math.random() * 100,
        firstTokenValueUsd: Math.random() * 100,
        secondTokenValue: Math.random() * 10000,
        secondTokenValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        tokenPair: 'SMOKES/CPASS',
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        firstToken: {
          name: 'SMOKES',
          id: 'smokes',
        },
        secondToken: {
          name: 'CPASS',
          id: 'cpass',
        },
        lpTokens: Math.random() * 1000000,
        totalValue: Math.random() * 1000,
        totalValueUsd: Math.random() * 100,
        firstTokenValue: Math.random() * 100,
        firstTokenValueUsd: Math.random() * 100,
        secondTokenValue: Math.random() * 10000,
        secondTokenValueUsd: Math.random() * 10,
      },
    ] as LiquidityItemType[],
    orderList: [
      {
        id: Math.random(),
        pair: 'ADA/LVLC',
        firstToken: {
          name: 'ADA',
          id: 'ada',
        },
        secondToken: {
          name: 'LVLC',
          id: 'lvlc',
        },
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: '043a2bfbb1d66d9883a068059a4e35bb53b7bdc6f5637d7b934150c453ffb116',
        totalValue: Math.random() * 10,
        totalValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        pair: 'MILK/LVLC',
        firstToken: {
          name: 'MILK',
          id: 'milk',
        },
        secondToken: {
          name: 'LVLC',
          id: 'lvlc',
        },
        DEX: 'Sundaeswap',
        DEXLink: 'https://v2.sundaeswap.finance/',
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: 'a0a863e8eb398c04caebdbd3a3e50733bcb6c06e118c36eadb7f7b53424668a5',
        totalValue: Math.random() * 10,
        totalValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        pair: 'DICE/WTAB',
        firstToken: {
          name: 'DICE',
          id: 'dice',
        },
        secondToken: {
          name: 'WTAB',
          id: 'wtab',
        },
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: '043a2bfbb1d66d9883a068059a4e35bb53b7bdc6f5637d7b934150c453ffb116',
        totalValue: Math.random() * 10,
        totalValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        pair: 'FREN/SMOKES',
        firstToken: {
          name: 'FREN',
          id: 'fren',
        },
        secondToken: {
          name: 'SMOKES',
          id: 'smokes',
        },
        DEX: 'Sundaeswap',
        DEXLink: 'https://v2.sundaeswap.finance/',
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: 'a0a863e8eb398c04caebdbd3a3e50733bcb6c06e118c36eadb7f7b53424668a5',
        totalValue: Math.random() * 10,
        totalValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        pair: 'CCCC/HOSKY',
        firstToken: {
          name: 'CCCC',
          id: 'cccc',
        },
        secondToken: {
          name: 'HOSKY',
          id: 'hosky',
        },
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: '043a2bfbb1d66d9883a068059a4e35bb53b7bdc6f5637d7b934150c453ffb116',
        totalValue: Math.random() * 10,
        totalValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        pair: 'CCCC/DRIP',
        firstToken: {
          name: 'CCCC',
          id: 'cccc',
        },
        secondToken: {
          name: 'DRIP',
          id: 'drip',
        },
        DEX: 'Sundaeswap',
        DEXLink: 'https://v2.sundaeswap.finance/',
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: 'a0a863e8eb398c04caebdbd3a3e50733bcb6c06e118c36eadb7f7b53424668a5',
        totalValue: Math.random() * 10,
        totalValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        pair: 'ATH/CATSKY',
        firstToken: {
          name: 'ATH',
          id: 'ath',
        },
        secondToken: {
          name: 'CATSKY',
          id: 'catsky',
        },
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: '043a2bfbb1d66d9883a068059a4e35bb53b7bdc6f5637d7b934150c453ffb116',
        totalValue: Math.random() * 10,
        totalValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        pair: 'ADA/USDC',
        firstToken: {
          name: 'ADA',
          id: 'ada',
        },
        secondToken: {
          name: 'USDC',
          id: 'usdc',
        },
        DEX: 'Minswap',
        DEXLink: 'https://app.minswap.org/',
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: 'a0a863e8eb398c04caebdbd3a3e50733bcb6c06e118c36eadb7f7b53424668a5',
        totalValue: Math.random() * 10,
        totalValueUsd: Math.random() * 10,
      },
      {
        id: Math.random(),
        pair: 'AVAX/COPI',
        firstToken: {
          name: 'AVAX',
          id: 'avax',
        },
        secondToken: {
          name: 'COPI',
          id: 'copi',
        },
        DEX: 'Sundaeswap',
        DEXLink: 'https://v2.sundaeswap.finance/',
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: 'a0a863e8eb398c04caebdbd3a3e50733bcb6c06e118c36eadb7f7b53424668a5',
        totalValue: Math.random() * 10,
        totalValueUsd: Math.random() * 10,
      },
    ] as OrderItemType[],
  },

  transactionHistory: [
    {
      type: HistoryItemType.SENT,
      status: HistoryItemStatus.LOW,
      time: getRandomTime(start24HoursAgo),
      feeValue: Math.random(),
      feeValueUsd: Math.random(),
      amountTotal: 1000000 * Math.random(),
      amountTotalUsd: 100000 * Math.random(),
      amountAsset: `${Math.round(100 * Math.random())} MILK`,
    },
    {
      type: HistoryItemType.RECEIVED,
      status: HistoryItemStatus.LOW,
      time: getRandomTime(start24HoursAgo),
      amountTotal: 1000000 * Math.random(),
      amountTotalUsd: 100000 * Math.random(),
      amountAsset: Math.round(10 * Math.random()),
    },
    {
      type: HistoryItemType.ERROR,
      status: HistoryItemStatus.FAILED,
      time: getRandomTime(start24HoursAgo),
      amountTotal: 1000000 * Math.random(),
      amountTotalUsd: 100000 * Math.random(),
      amountAsset: Math.round(10 * Math.random()),
    },
    {
      type: HistoryItemType.WITHDRAW,
      status: HistoryItemStatus.HIGH,
      time: getRandomTime(start1WeekAgo),
      feeValue: Math.random(),
      feeValueUsd: Math.random(),
      amountTotal: 1000000 * Math.random(),
      amountTotalUsd: 100000 * Math.random(),
      amountAsset: `${Math.round(100 * Math.random())} MILK`,
    },
    {
      type: HistoryItemType.DELEGATE,
      status: HistoryItemStatus.HIGH,
      time: getRandomTime(start24HoursAgo),
      feeValue: Math.random(),
      feeValueUsd: Math.random(),
      amountTotal: 1000000 * Math.random(),
      amountTotalUsd: 100000 * Math.random(),
      amountAsset: `${Math.round(100 * Math.random())} MILK`,
    },
  ] as TransactionItemType[],
};

export default mockData;
