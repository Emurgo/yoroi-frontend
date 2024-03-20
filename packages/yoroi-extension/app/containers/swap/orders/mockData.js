// @flow
import { ReactComponent as AdaTokenImage } from '../mockAssets/ada.inline.svg';
import { ReactComponent as UsdaTokenImage } from '../mockAssets/usda.inline.svg';
import { ReactComponent as MilkTokenImage } from '../mockAssets/milk.inline.svg';
import { ReactComponent as LvlcTokenImage } from '../mockAssets/lvlc.inline.svg';
import { ReactComponent as MuesliImage } from '../../../assets/images/revamp/dex/muesli.inline.svg';
import { ReactComponent as SundaeImage } from '../../../assets/images/revamp/dex/sundae.inline.svg';
import { ReactComponent as MinswapImage } from '../../../assets/images/revamp/dex/minswap.inline.svg';

export const mockCompletedOrders: Array<any> = [
  {
    to: { image: <MilkTokenImage />, ticker: 'MILK' },
    from: { image: <UsdaTokenImage />, ticker: 'USDA' },
    price: 2,
    amount: 10,
    total: 20,
    totalAda: 7,
    dex: { image: <MuesliImage />, name: 'Muesliswap' },
    datetime: 'Jun 26, 2023, 22:29:27',
    txId: 'ebc5313...86b54',
  },
  {
    from: { image: <AdaTokenImage />, ticker: 'ADA' },
    to: { image: <LvlcTokenImage />, ticker: 'LVLC' },
    price: 5,
    amount: 10,
    total: 11,
    totalAda: 5,
    dex: { image: <SundaeImage />, name: 'Sundaeswap' },
    datetime: 'Jun 22, 2023, 10:06:04',
    txId: 'ebc5433...86b254',
  },
  {
    from: { image: <AdaTokenImage />, ticker: 'ADA' },
    to: { image: <LvlcTokenImage />, ticker: 'LVLC' },
    price: 5,
    amount: 10,
    total: 11,
    totalAda: 5,
    dex: { image: <MinswapImage />, name: 'Minswap' },
    datetime: 'Jun 22, 2023, 10:05:04',
    txId: 'ebc3533...86b254',
  },
];
