import { HistoryItemType } from '../../features/portfolio/useCases/TokenDetails/TransactionTable';

// UTILS
const getRandomTime = (startDate, endDate) => {
  const date = new Date(
    startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
  );
  return date.toISOString();
};
const startDate = new Date('01-01-2023 8:30');
const endDate = new Date('05-28-2024 11:40');
const now = new Date();
const start24HoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const start1WeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const start1MonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

// ALL THE MOCK DATA FOR RENDERING UI NEW
const mockData = {
  wallet: {
    tokenList: [
      {
        name: 'AGIX',
        id: 'Agix',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'DOGE',
        id: 'Doge',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'ADA',
        id: 'Ada',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'Shiba',
        id: 'shiba',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'ALT',
        id: 'alt',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN1',
        id: 'Tkn1',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN2',
        id: 'Tkn2',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN3',
        id: 'Tkn3',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN6',
        id: 'Tkn6',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN8',
        id: 'Tkn8',
        price: (10 * Math.random()).toFixed(2),
        portfolioPercents: Math.round(100 * Math.random()),
        '24h': -(10 * Math.random()).toFixed(2),
        '1W': (10 * Math.random()).toFixed(2),
        '1M': (10 * Math.random()).toFixed(2),
        totalAmount: Math.round(100000 * Math.random()),
        totalAmountUsd: Math.round(100000 * Math.random()),
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId:
            'asset155qynmnez65dr3tz5699wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzdv20el66l8j025e4g6k0kafjfv4ukawsly9ats',
          fingerprint:
            'asset399q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj1234',
        },
        performance: [
          { value: Math.random().toFixed(3) },
          { value: Math.random().toFixed(2) },
          { value: `${Math.round(1000 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}M` },
          { value: `${Math.round(100 * Math.random())}` },
          { value: (100 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (1000 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(2) },
          { value: (10 * Math.random()).toFixed(5) },
        ],
        chartData: [
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start24HoursAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1WeekAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(start1MonthAgo, now),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomTime(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
    ],
  },

  dapps: {
    liquidityList: [
      {
        id: Math.random(),
        tokenPair: 'ADA/LVLC',
        DEX: 'Minswap',
        firstToken: {
          name: 'ADA',
          id: 'ada',
        },
        secondToken: {
          name: 'LVLC',
          id: 'lvlc',
        },
        PNLValue: (Math.random() * 10).toFixed(2),
        PNLValueUsd: (Math.random() * 10).toFixed(2),
        lpTokens: (Math.random() * 1000000).toFixed(2),
        totalValue: (Math.random() * 1000).toFixed(2),
        totalValueUsd: (Math.random() * 100).toFixed(2),
        firstTokenValue: (Math.random() * 100).toFixed(2),
        firstTokenValueUsd: (Math.random() * 100).toFixed(2),
        secondTokenValue: (Math.random() * 10000).toFixed(2),
        secondTokenValueUsd: (Math.random() * 10).toFixed(2),
      },
      {
        id: Math.random(),
        tokenPair: 'DOGE/Shiba',
        DEX: 'Sundaeswap',
        firstToken: {
          name: 'DOGE',
          id: 'doge',
        },
        secondToken: {
          name: 'Shiba',
          id: 'shiba',
        },
        PNLValue: (Math.random() * 10).toFixed(2),
        PNLValueUsd: (Math.random() * 10).toFixed(2),
        lpTokens: (Math.random() * 1000000).toFixed(2),
        totalValue: (Math.random() * 1000).toFixed(2),
        totalValueUsd: (Math.random() * 100).toFixed(2),
        firstTokenValue: (Math.random() * 100).toFixed(2),
        firstTokenValueUsd: (Math.random() * 100).toFixed(2),
        secondTokenValue: (Math.random() * 10000).toFixed(2),
        secondTokenValueUsd: (Math.random() * 10).toFixed(2),
      },
      {
        id: Math.random(),
        tokenPair: 'DBZ/ADA',
        DEX: 'Sundaeswap',
        firstToken: {
          name: 'DBZ',
          id: 'dbz',
        },
        secondToken: {
          name: 'ADA',
          id: 'ada',
        },
        PNLValue: (Math.random() * 10).toFixed(2),
        PNLValueUsd: (Math.random() * 10).toFixed(2),
        lpTokens: (Math.random() * 1000000).toFixed(2),
        totalValue: (Math.random() * 1000).toFixed(2),
        totalValueUsd: (Math.random() * 100).toFixed(2),
        firstTokenValue: (Math.random() * 100).toFixed(2),
        firstTokenValueUsd: (Math.random() * 100).toFixed(2),
        secondTokenValue: (Math.random() * 10000).toFixed(2),
        secondTokenValueUsd: (Math.random() * 10).toFixed(2),
      },
    ],
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
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: '043a2bfbb1d66d9883a068059a4e35bb53b7bdc6f5637d7b934150c453ffb116',
        totalValue: (Math.random() * 10).toFixed(2),
        totalValueUsd: (Math.random() * 10).toFixed(2),
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
        assetPrice: Math.round(Math.random() * 10),
        assetAmount: Math.round(Math.random() * 10),
        transactionId: 'a0a863e8eb398c04caebdbd3a3e50733bcb6c06e118c36eadb7f7b53424668a5',
        totalValue: (Math.random() * 10).toFixed(2),
        totalValueUsd: (Math.random() * 10).toFixed(2),
      },
    ],
  },

  PortfolioPage: {
    balance: {
      ada: (100000 * Math.random()).toFixed(2),
      usd: (1000 * Math.random()).toFixed(2),
      percents: -Math.random().toFixed(2),
      amount: -Math.random().toFixed(2),
    },
  },

  history: [
    {
      type: HistoryItemType.SENT,
      time: '2024-05-28T06:28:00.000Z',
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
      type: HistoryItemType.RECEIVED,
      time: '2024-05-27T08:25:00.000Z',
      status: 'Low',
      amount: {
        total: '1,169,789.34432 ADA',
        usd: '312,323.33 USD',
        asset: 2,
      },
    },
    {
      type: HistoryItemType.ERROR,
      time: '2024-05-24T11:04:27.000Z',
      status: 'Failed',
      amount: {
        total: '1,169,789.34432 ADA',
        usd: '312,323.33 USD',
        asset: 2,
      },
    },
    {
      type: HistoryItemType.WITHDRAW,
      time: '2024-05-08T11:04:27.000Z',
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
      type: HistoryItemType.DELEGATE,
      time: '2024-05-08T11:04:27.000Z',
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
};

export default mockData;
