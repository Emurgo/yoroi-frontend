// @flow
import { darkPalette } from '../base-palettes/dark-palette';
import { tokens } from '../tokens/tokens';

const { opacity } = tokens;

export const dark = {
  ...darkPalette,

  text_primary_max: darkPalette.primary_700, // hover, text, button, links, text in tabs, chips
  text_primary_medium: darkPalette.primary_600, // links, tabs, chips, special cases
  text_primary_min: darkPalette.primary_300, // disabled, buttons, links

  text_gray_max: darkPalette.gray_max, // hover and pressed
  text_gray_medium: darkPalette.gray_900, // draws attention
  text_gray_low: darkPalette.gray_600, // accent or additional text
  text_gray_min: darkPalette.gray_400, // disabled text

  text_error: darkPalette.sys_magenta_500, // error messages
  text_warning: darkPalette.sys_orange_500, // warning messages
  text_success: darkPalette.secondary_500, // success messages
  text_info: darkPalette.sys_cyan_500, // info messages

  bg_color_max: darkPalette.gray_50, // bottom surface
  bg_color_max: darkPalette.gray_100, // upper surface

  el_primary_max: darkPalette.primary_700, // hover'nd pressed state, actianable elements
  el_primary_medium: darkPalette.primary_600, // actionable elements
  el_primary_min: darkPalette.primary_300, // disabled elements, icons

  el_gray_max: darkPalette.gray_max, // hover and pressed, icons, shapes, lines in buttons, icons in banners
  el_gray_medium: darkPalette.gray_900, // icons, shapes, lines in buttons, chips, tabs, checkboxes, readio, switch
  el_gray_low: darkPalette.gray_600, // icons, shapes, inputs, bottom navigation bar
  el_gray_min: darkPalette.gray_400, // input stroke, disabled state for most components

  el_secondary: darkPalette.secondary_600, // success state

  web_overlay: `${darkPalette.gray_100}${opacity._80}`, // extension modal overlay
  web_sidebar_item_active: `${darkPalette.black_static}${opacity._16}`, // extension active sidebar item background
  web_sidebar_item_inactive: `${darkPalette.white_static}${opacity._48}`, // extension inactive sidebar item
  special_web_bg_sidebar: 'rgba(0, 0, 0, 0.24)',
  // TODO renamed to
  web_sidebar_item_active_bg: `${darkPalette.black_static}${opacity._24}`,

  mobile_overlay: `${darkPalette.black_static}${opacity._40}`, // mobile bottom sheet overlay
  mobile_bg_blur: `${darkPalette.gray_50}${opacity._80}`, // mobile bottom sheet background
};
