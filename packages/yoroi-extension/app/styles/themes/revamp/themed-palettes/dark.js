import { darkPalette } from '../base-palettes/dark-palette';

export const dark = {
  ...darkPalette,

  text_primary_high: darkPalette.primary_c700, // hover, text, button, links, text in tabs, chips
  text_primary_medium: darkPalette.primary_c600, // links, tabs, chips, special cases
  text_primary_low: darkPalette.primary_c300, // disabled, buttons, links
  text_primary_on: darkPalette.white_static, // primary color surfaces
  text_gray_max: darkPalette.gray_cmax, // hover and pressed
  text_gray_normal: darkPalette.gray_c900, // draws attention
  text_gray_medium: darkPalette.gray_c600, // accent or additional text
  text_gray_low: darkPalette.gray_c400, // disabled text
  text_error: darkPalette.sys_magenta_c500, // error messages
  text_warning: darkPalette.sys_orange_c500, // warning messages
  text_success: darkPalette.secondary_c500, // success messages
  text_info: darkPalette.sys_cyan_c500, // info messages

  bg_color_high: darkPalette.gray_cmin, // bottom surface
  bg_color_low: darkPalette.gray_c100, // upper surface

  el_primary_high: darkPalette.primary_c700, // hover'nd pressed state, actianable elements
  el_primary_medium: darkPalette.primary_c600, // actionable elements
  el_primary_low: darkPalette.primary_c300, // disabled elements, icons
  el_gray_high: darkPalette.gray_cmax, // hover and pressed, icons, shapes, lines in buttons, icons in banners
  el_gray_normal: darkPalette.gray_c900, // icons, shapes, lines in buttons, chips, tabs, checkboxes, readio, switch
  el_gray_medium: darkPalette.gray_c600, // icons, shapes, inputs, bottom navigation bar
  el_gray_low: darkPalette.gray_c400, // input stroke, disabled state for most components
  el_secondary_medium: darkPalette.secondary_c600, // success state
  el_static_white: darkPalette.white_static, // text and icons buttons and chips
};
