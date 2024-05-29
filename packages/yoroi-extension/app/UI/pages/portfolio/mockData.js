import { HistoryItemType } from '../../features/portfolio/useCases/TokenDetails/TransactionTable';

// UTILS
function getRandomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}
const startDate = new Date('01-01-2023 8:30');
const endDate = new Date('05-28-2024 11:40');

// ALL THE MOCK DATA FOR RENDERING UI NEW
const mockData = {
  wallet: {
    tokenList: [
      {
        name: 'AGIX',
        id: 'Agix',
        price: 0.23,
        portfolioPercents: 75,
        '24h': -0.03,
        '1W': 0.83,
        '1M': 0.89,
        totalAmount: 281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: '2024-05-28T04:43:27.000Z',
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'ADA',
        id: 'ada',
        price: 0.23,
        portfolioPercents: 68,
        '24h': -0.59,
        '1W': 0.24,
        '1M': 0.17,
        totalAmount: 321023,
        totalAmountUsd: 2561,
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
        },
        performance: [
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '1' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN',
        id: 'Tkn',
        price: 0.82,
        portfolioPercents: 34,
        '24h': -0.93,
        '1W': 0.23,
        '1M': 0.829,
        totalAmount: 1281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'DOGE',
        id: 'Doge',
        price: 0.23,
        portfolioPercents: 75,
        '24h': -0.03,
        '1W': 0.83,
        '1M': 0.89,
        totalAmount: 281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: '2024-05-28T04:43:27.000Z',
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'Shiba',
        id: 'shiba',
        price: 0.23,
        portfolioPercents: 68,
        '24h': -0.59,
        '1W': 0.24,
        '1M': 0.17,
        totalAmount: 321023,
        totalAmountUsd: 2561,
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
        },
        performance: [
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '1' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN2',
        id: 'Tkn2',
        price: 0.82,
        portfolioPercents: 34,
        '24h': -0.93,
        '1W': 0.23,
        '1M': 0.829,
        totalAmount: 1281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN3',
        id: 'Tkn3',
        price: 0.82,
        portfolioPercents: 34,
        '24h': -0.93,
        '1W': 0.23,
        '1M': 0.829,
        totalAmount: 1281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN4',
        id: 'Tkn4',
        price: 0.82,
        portfolioPercents: 34,
        '24h': -0.93,
        '1W': 0.23,
        '1M': 0.829,
        totalAmount: 1281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN5',
        id: 'Tkn5',
        price: 0.82,
        portfolioPercents: 34,
        '24h': -0.93,
        '1W': 0.23,
        '1M': 0.829,
        totalAmount: 1281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN6',
        id: 'Tkn6',
        price: 0.82,
        portfolioPercents: 34,
        '24h': -0.93,
        '1W': 0.23,
        '1M': 0.829,
        totalAmount: 1281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN7',
        id: 'Tkn7',
        price: 0.82,
        portfolioPercents: 34,
        '24h': -0.93,
        '1W': 0.23,
        '1M': 0.829,
        totalAmount: 1281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
        ],
      },
      {
        name: 'TKN8',
        id: 'Tkn8',
        price: 0.82,
        portfolioPercents: 34,
        '24h': -0.93,
        '1W': 0.23,
        '1M': 0.829,
        totalAmount: 1281023,
        totalAmountUsd: 372561,
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
          { value: '0,277' },
          { value: '0,48' },
          { value: '557M' },
          { value: '34M' },
          { value: '55' },
          { value: '67,00' },
          { value: '100,67' },
          { value: '400,60' },
          { value: '3,01' },
          { value: '0,00002' },
        ],
        chartData: [
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
            value: Math.random().toFixed(3),
            usd: Math.random().toFixed(3) * 1000,
          },
          {
            time: getRandomDate(startDate, endDate),
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
        transactionId: 'ebc533812j3jajsasdaasdasdkasdkaskd91286b54',
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
        transactionId: 'a2hd33812j3jajsasdaasdasdkasdkaskd912i5gr12',
        totalValue: (Math.random() * 10).toFixed(2),
        totalValueUsd: (Math.random() * 10).toFixed(2),
      },
    ],
  },

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
