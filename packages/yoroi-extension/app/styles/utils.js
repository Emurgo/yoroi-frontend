// @flow


export const readCssVar = (varName: string): string => {
  varName = varName.startsWith('--') ? varName : '--' + varName;
  return window.getComputedStyle(document.documentElement).getPropertyValue(varName);
};

export const writeCssVar = (varName: string, value: any): void => {
  varName = varName.startsWith('--') ? varName : '--' + varName;
  document.documentElement?.style.setProperty(varName, value);
};

export const asImportant = (style: string | number): string => style + ' !important';
