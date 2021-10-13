// @flow
//  ==== Theme: Yoroi Modern === //

const YoroiModern = {};

// *************************************************************
// Here we are overriding YoroiModern theme for Shelley Testnet
// Creating a new theme is costly because not only color
// changes but layout is different in different theme.
// e.g for new theme we need to override :global(.NewTheme)
// is needed in UI style files or :global(.OldTheme, .NewTheme)
// *************************************************************

export const getThemeVars: ('shelley' | void) => { ... } = env => {
  if (env === 'shelley') {
    const mergedTheme = {
      ...YoroiModern,
    };
    return mergedTheme;
  }
  return YoroiModern;
};
