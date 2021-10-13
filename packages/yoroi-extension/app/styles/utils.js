// @flow
function readCssVar(varName: string): string {
  varName = varName.startsWith('--') ? varName : '--' + varName;
  return window.getComputedStyle(document.documentElement).getPropertyValue(varName);
}
export { readCssVar };
