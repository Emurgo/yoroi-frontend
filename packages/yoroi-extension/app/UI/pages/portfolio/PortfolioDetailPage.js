// @flow
import React from 'react';
import TokenDetails from '../../features/portfolio/useCases/TokenDetails/TokenDetails';
import PortfolioPageLayout from '../../layout/PortfolioPageLayout';
import mockData from './mockData';

type Props = {|
  stores: any,
  actions: any,
  match: any,
|};

const PortfolioDetailPage = ({ stores, actions, match }: Props) => {
  const tokenId = match.params.tokenId;

  const tokenInfo = {
    marketPrice: {
      current: '0,68',
      percents: {
        active: true,
        value: '0,79',
      },
      usd: {
        active: true,
        value: '8,33',
      },
      chartData: [
        { date: '05/24/2024 14:37', value: Math.random().toFixed(3) },
        { date: '05/01/2024 14:37', value: Math.random().toFixed(3) },
        { date: '05/02/2024 18:21', value: Math.random().toFixed(3) },
        { date: '05/03/2024 22:37', value: Math.random().toFixed(3) },
        { date: '05/24/2024 13:37', value: Math.random().toFixed(3) },
        { date: '05/24/2024 10:27', value: Math.random().toFixed(3) },
        { date: '05/24/2024 08:18', value: Math.random().toFixed(3) },
        { date: '08/17/2023 14:37', value: Math.random().toFixed(3) },
        { date: '09/24/2023 14:37', value: Math.random().toFixed(3) },
        { date: '08/17/2022 14:37', value: Math.random().toFixed(3) },
        { date: '09/24/2022 14:37', value: Math.random().toFixed(3) },
        { date: '08/17/2021 14:37', value: Math.random().toFixed(3) },
        { date: '09/24/2021 14:37', value: Math.random().toFixed(3) },
        { date: '05/23/2024 18:37', value: Math.random().toFixed(3) },
        { date: '05/23/2024 20:37', value: Math.random().toFixed(3) },
        { date: '05/20/2024 12:22', value: Math.random().toFixed(3) },
        { date: '04/24/2024 12:22', value: Math.random().toFixed(3) },
        { date: '04/24/2024 12:22', value: Math.random().toFixed(3) },
        { date: '03/24/2024 04:22', value: Math.random().toFixed(3) },
        { date: '03/24/2024 09:22', value: Math.random().toFixed(3) },
        { date: '02/24/2024 18:22', value: Math.random().toFixed(3) },
        { date: '01/24/2024 23:22', value: Math.random().toFixed(3) },
      ],
    },
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
  };

  return (
    <PortfolioPageLayout stores={stores} actions={actions}>
      <TokenDetails tokenInfo={tokenInfo} mockHistory={mockData.PortfolioDetailPage.history} />
    </PortfolioPageLayout>
  );
};

export default PortfolioDetailPage;
