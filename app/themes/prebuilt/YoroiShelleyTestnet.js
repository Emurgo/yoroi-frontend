// @flow
//  ==== Theme: Yoroi Shelley Testnet === //

// Using YoroiModern as base for YoroiShelleyTestnet theme
import YoroiShelleyTestnet from './YoroiModern';

// Here you can override or add new key-value pair
const overrides = {
  '--theme-topbar-background-color': 'linear-gradient(225deg, #F14D78 0%, #1A44B7 100%)'
};

export default Object.assign(YoroiShelleyTestnet, overrides);
