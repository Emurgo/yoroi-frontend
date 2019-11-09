// @flow
//  ==== Theme: Yoroi Shelley Testnet === //

// Using YoroiModern as base for YoroiShelleyTestnet theme
import YoroiShelleyTestnet from './YoroiModern';

// Here you can override or add new key-value pair
const overrides = {
  // Toolbar
  '--theme-topbar-background-color': 'linear-gradient(225deg, #F14D78 0%, #1A44B7 100%)',
  // Button
  '--theme-button-primary-background-color': 'linear-gradient(224.33deg, #3154CB 0%, #2048BD 100%)',
  '--theme-button-primary-background-color-hover': '#4e70e6',  // TODO: fix color
  '--theme-button-primary-background-color-active': '#1A44B7', // TODO: fix color
  '--theme-button-primary-background-color-disabled': 'rgba(49,84,203,0.35)',
};

export default Object.assign(YoroiShelleyTestnet, overrides);
