import React from 'react';
import TokenDetailsPage from '../../components/portfolio/TokenDetailsPage';

const tokenInfo = {
  performance: [
    { label: 'Token price change', value: '0,277 USD' },
    { label: 'Token price', value: '0,48 USD' },
    { label: 'Market cap', value: '557M USD' },
    { label: '24h volumn', value: '34M USD' },
    { label: 'Rank', value: '#55' },
    { label: 'Circulating', value: '67,00 ADA' },
    { label: 'Total supply', value: '100,67 ADA' },
    { label: 'Max supply', value: '400,60 ADA' },
    { label: 'All time high', value: '3,01 USD' },
    { label: 'All time low', value: '0,00002 USD' },
  ],
  overview: {
    tokenName: 'ADA',
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
    website: 'cardano.org',
    detailOn: 'www.',
  },
};

const subMenuOptions = [
  {
    label: 'Performance',
    className: 'performance',
    route: 'performance',
  },
  {
    label: 'Overview',
    className: 'overview',
    route: 'overview',
  },
];

function createData(name: string, calories: number, fat: number, carbs: number, protein: number) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const PortfolioDetailPage = ({ match }) => {
  const tokenId = match.params.tokenId;

  return (
    <TokenDetailsPage
      tokenInfo={tokenInfo}
      subMenuOptions={subMenuOptions}
      rows={rows}
    />
  );
};

export default PortfolioDetailPage;
