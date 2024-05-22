import React from 'react';
import WalletPage from '../../features/portfolio/WalletPage';

const headCells = [
  { id: 'name', label: 'Name', align: 'left' },
  { id: 'price', label: 'Price', align: 'left' },
  { id: '24h', label: '24H', align: 'left' },
  { id: '1w', label: '1W', align: 'left' },
  { id: '1m', label: '1M', align: 'left' },
  { id: 'portfolioPercents', label: 'Portfolio %', align: 'left' },
  { id: 'totalAmount', label: 'Total amount', align: 'right' },
];

const mockData = [
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
];

const PortfolioPage = () => {
  return <WalletPage headCells={headCells} mockData={mockData} />;
};

export default PortfolioPage;
