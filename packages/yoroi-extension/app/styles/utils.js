// @flow

/*
 Check if the stylesheet is internal or hosted on the current domain.
 See https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet#Notes
*/

const isSameDomain = styleSheet => {
  // Internal style blocks won't have an href value
  if (!styleSheet.href) {
    return true;
  }
  return styleSheet.href.indexOf(window.location.origin) === 0;
};

/*
 Determine if the given rule is a CSSStyleRule
 See: https://developer.mozilla.org/en-US/docs/Web/API/CSSRule#Type_constants
*/

const isStyleRule = rule => rule.type === 1;

/**
 * Get all custom properties on a page
 * @return array<array[string, string]>
 * ex; [["--color-accent", "#b9f500"], ["--color-text", "#252525"], ...]
 */
const getCSSCustomPropIndex = () =>
  [...document.styleSheets].filter(isSameDomain).reduce(
    (finalArr, sheet) =>
      finalArr.concat(
        // $FlowFixMe[prop-missing]
        [...sheet.cssRules].filter(isStyleRule).reduce((propValArr, rule) => {
          const props = [...rule.style]
            .map(propName => [propName.trim(), rule.style.getPropertyValue(propName).trim()])
            // Discard any props that don't start with "--yoroi" prefix.
            .filter(([propName]) => propName.indexOf('--yoroi') === 0);
          return [...propValArr, ...props];
        }, [])
      ),
    []
  );

export const getCSSCustomPropObject: void => Object = () => {
  const allCSSVars = getCSSCustomPropIndex();
  const mapAllCssVars = allCSSVars.map(([cssVar, cssValue]) => ({
    [cssVar]: cssValue,
  }));
  return Object.assign({}, ...mapAllCssVars);
};

export const readCssVar = (varName: string): string => {
  varName = varName.startsWith('--') ? varName : '--' + varName;
  return window.getComputedStyle(document.documentElement).getPropertyValue(varName);
};

export const writeCssVar = (varName: string, value: any): void => {
  varName = varName.startsWith('--') ? varName : '--' + varName;
  document.documentElement?.style.setProperty(varName, value);
};

export const asImportant = (style: string | number): string => style + ' !important';
