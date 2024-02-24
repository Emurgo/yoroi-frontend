//@flow
import { ReactComponent as AdaTokenImage } from '../mockAssets/ada.inline.svg';
import { ReactComponent as UsdaTokenImage } from '../mockAssets/usda.inline.svg';
import { ReactComponent as MilkTokenImage } from '../mockAssets/milk.inline.svg';

export const defaultFromAsset: any = {
  image: <AdaTokenImage />,
  name: 'TADA',
  ticker: 'TADA',
  walletAmount: 212,
  usdPrice: 0.29,
  address: 'TADA',
  adaPrice: 1,
  volume24h: 0,
};

export const defaultToAsset: any = {
  amount: '',
  walletAmount: 0,
  ticker: '',
  address: '',
  name: '',
  image: null,
};

export const fromAssets: Array<any> = [
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

export const toAssets: Array<any> = [
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
