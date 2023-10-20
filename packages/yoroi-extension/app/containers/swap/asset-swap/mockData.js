import { ReactComponent as AdaTokenImage } from '../mockAssets/ada.inline.svg';
import { ReactComponent as UsdaTokenImage } from '../mockAssets/usda.inline.svg';
import { ReactComponent as MilkTokenImage } from '../mockAssets/milk.inline.svg';
import { ReactComponent as MinswapImage } from '../mockAssets/minswap.inline.svg';
import { ReactComponent as SundaeImage } from '../mockAssets/sundae.inline.svg';
import { ReactComponent as MuesliImage } from '../mockAssets/muesli.inline.svg';

export const defaultFromAsset = {
  image: <AdaTokenImage />,
  name: 'TADA',
  ticker: 'TADA',
  walletAmount: 212,
  usdPrice: 0.29,
  address: 'TADA',
  adaPrice: 1,
  volume24h: 0,
};

export const defaultToAsset = { amount: '', walletAmount: 0, ticker: '' };

export const fromAssets = [
  {
    image: <AdaTokenImage />,
    name: 'TADA',
    ticker: 'TADA',
    walletAmount: 212,
    usdPrice: 0.29,
    address: 'TADA',
    adaPrice: 1,
    volume24h: 0,
  },
];

export const toAssets = [
  {
    image: <UsdaTokenImage />,
    name: 'Anzens USD',
    ticker: 'USDA',
    walletAmount: 0,
    address: 'addr1asdl4bl0f328dsckmx23443mllsdkfj32e4',
    adaPrice: 0.26,
    volume24h: 10200033322,
    priceChange100: '-2.45%',
  },
  {
    image: <MilkTokenImage />,
    name: 'MILK',
    ticker: 'MILK',
    walletAmount: 5,
    address: 'addr13sdlsad3f328dsckmx23443mllsdkf944f',
    adaPrice: 0.26,
    volume24h: 20033322,
    priceChange100: '1.09%',
  },
];

export const poolList = [
  {
    name: 'Minswap',
    image: <MinswapImage />,
    price: 3,
    liquidity: '15,812,265,906,545',
    fee: 0.32,
    deposit: 2,
    isAuto: true,
  },
  {
    name: 'Muesliswap',
    image: <MuesliImage />,
    price: 3,
    liquidity: '4,812,265,906,545',
    fee: 0.3,
    deposit: 2,
  },
  {
    name: 'Sundaeswap',
    image: <SundaeImage />,
    price: 3,
    liquidity: '265,906,545',
    fee: 0.4,
    deposit: 2.5,
  },
];
