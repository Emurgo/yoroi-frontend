import React from 'react';
import TokenDetailsPage from '../../features/portfolio/TokenDetailsPage';

const subMenuOptions = [
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
];

const mockHistory = [
  {
    type: 'Sent',
    time: '11:30 PM',
    date: '05/22/2024',
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
    date: '05/22/2024',
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
    date: '05/21/2024',
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
];

const PortfolioDetailPage = ({ match }) => {
  const tokenId = match.params.tokenId;

  const tokenInfo = {
    overview: {
      tokenName: tokenId,
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
      { value: '0,277 USD' },
      { value: '0,48 USD' },
      { value: '557M USD' },
      { value: '34M USD' },
      { value: '#55' },
      { value: '67,00 ADA' },
      { value: '100,67 ADA' },
      { value: '400,60 ADA' },
      { value: '3,01 USD' },
      { value: '0,00002 USD' },
    ],
  };

  return (
    <TokenDetailsPage
      tokenInfo={tokenInfo}
      subMenuOptions={subMenuOptions}
      mockHistory={mockHistory}
    />
  );
};

export default PortfolioDetailPage;
