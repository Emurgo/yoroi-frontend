// @flow
import { lightPalette } from '../base-palettes/light-palette';
import { tokens } from '../tokens/tokens';

const { opacity } = tokens;

export const light = {
  ...lightPalette,

  text_primary_max: lightPalette.primary_600, // hover, text, button, links, text in tabs, chips
  text_primary_medium: lightPalette.primary_500, // links, tabs, chips, special cases
  text_primary_min: lightPalette.primary_300, // disabled, buttons, links

  text_gray_max: lightPalette.gray_max, // hover and pressed
  text_gray_medium: lightPalette.gray_900, // draws attention
  text_gray_low: lightPalette.gray_600, // accent or additional text
  text_gray_min: lightPalette.gray_400, // disabled text

  text_error: lightPalette.sys_magenta_500, // error messages
  text_warning: lightPalette.sys_orange_500, // warning messages
  text_success: lightPalette.secondary_500, // success messages
  text_info: lightPalette.sys_cyan_500, // info messages

  bg_color_max: lightPalette.gray_min, // bottom surface
  bg_color_min: lightPalette.gray_100, // upper surface

  el_primary_max: lightPalette.primary_600, // hover'nd pressed state, actianable elements
  el_primary_medium: lightPalette.primary_500, // actionable elements
  el_primary_min: lightPalette.primary_300, // disabled elements, icons

  el_gray_max: lightPalette.gray_max, // hover and pressed, icons, shapes, lines in buttons, icons in banners
  el_gray_medium: lightPalette.gray_900, // icons, shapes, lines in buttons, chips, tabs, checkboxes, readio, switch
  el_gray_low: lightPalette.gray_600, // icons, shapes, inputs, bottom navigation bar
  el_gray_min: lightPalette.gray_400, // input stroke, disabled state for most components

  el_secondary: lightPalette.secondary_400, // success state

  web_overlay: `${lightPalette.black_static}${opacity._70}`, // extension modal overlay
  web_sidebar_item_active: `${lightPalette.black_static}${opacity._16}`, // extension active sidebar item background
  web_sidebar_item_inactive: `${lightPalette.white_static}${opacity._48}`, // extension inactive sidebar item

  special_web_bg_sidebar: 'rgba(0, 0, 0, 0.16)',
  // TODO new to be added in code
  web_sidebar_item_active_bg: `${lightPalette.black_static}${opacity._16}`,

  mobile_overlay: `${lightPalette.black_static}${opacity._40}`, // mobile bottom sheet overlay
  mobile_bg_blur: `${lightPalette.white_static}${opacity._80}`, // mobile bottom sheet background
};
