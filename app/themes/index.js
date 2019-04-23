// @flow

export const THEMES = Object.freeze({
  YOROI_CLASSIC: 'YoroiClassic',
  YOROI_MODERN: 'YoroiModern'
});

export type Themes = $Values<typeof THEMES>;
