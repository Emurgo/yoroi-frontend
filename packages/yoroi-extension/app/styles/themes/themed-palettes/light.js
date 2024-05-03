import { lightPalette } from '../base-palettes/light-palette';
import { tokens } from '../tokens/tokens';

const { opacity } = tokens;

export const light = {
  ...lightPalette,

  text_primary_high: lightPalette.primary_c600, // hover, text, button, links, text in tabs, chips
  text_primary_medium: lightPalette.primary_c500, // links, tabs, chips, special cases
  text_primary_low: lightPalette.primary_c300, // disabled, buttons, links
  text_primary_on: lightPalette.white_static, // primary color surfaces
  text_gray_max: lightPalette.gray_cmax, // hover and pressed
  text_gray_normal: lightPalette.gray_c900, // draws attention
  text_gray_medium: lightPalette.gray_c600, // accent or additional text
  text_gray_low: lightPalette.gray_c400, // disabled text
  text_error: lightPalette.sys_magenta_c500, // error messages
  text_warning: lightPalette.sys_orange_c500, // warning messages
  text_success: lightPalette.secondary_c500, // success messages
  text_info: lightPalette.sys_cyan_c500, // info messages

  bg_color_high: lightPalette.gray_cmin, // bottom surface
  bg_color_low: lightPalette.gray_c100, // upper surface

  el_primary_high: lightPalette.primary_c600, // hover'nd pressed state, actianable elements
  el_primary_medium: lightPalette.primary_c500, // actionable elements
  el_primary_low: lightPalette.primary_c300, // disabled elements, icons
  el_gray_high: lightPalette.gray_cmax, // hover and pressed, icons, shapes, lines in buttons, icons in banners
  el_gray_normal: lightPalette.gray_c900, // icons, shapes, lines in buttons, chips, tabs, checkboxes, readio, switch
  el_gray_medium: lightPalette.gray_c600, // icons, shapes, inputs, bottom navigation bar
  el_gray_low: lightPalette.gray_c400, // input stroke, disabled state for most components
  el_secondary_medium: lightPalette.secondary_c400, // success state
  el_static_white: lightPalette.white_static, // text and icons buttons and chips

  web_overlay: `${lightPalette.black_static}${opacity._70}`, // extension modal overlay
  web_sidebar_item_active: `${lightPalette.black_static}${opacity._16}`, // extension active sidebar item background
  web_sidebar_item_inactive: `${lightPalette.white_static}${opacity._48}`, // extension inactive sidebar item

  mobile_overlay: `${lightPalette.black_static}${opacity._40}`, // mobile bottom sheet overlay
  mobile_bg_blur: `${lightPalette.white_static}${opacity._80}`, // mobile bottom sheet background
};
