// @flow

import { classicTheme } from './themes/classic-theme';
import { modernTheme } from './themes/modern-theme';
import { revampTheme } from './themes/revamp-theme';

export const THEMES = Object.freeze({
  YOROI_CLASSIC: 'YoroiClassic',
  YOROI_MODERN: 'YoroiModern',
  YOROI_REVAMP: 'YoroiRevamp',
});

export type Theme = $Values<typeof THEMES>;

export const MuiThemes: {| [Theme]: Object |} = Object.freeze({
  [THEMES.YOROI_CLASSIC]: classicTheme,
  [THEMES.YOROI_MODERN]: modernTheme,
  [THEMES.YOROI_REVAMP]: revampTheme,
});

// Refer: https://github.com/Emurgo/yoroi-frontend/pull/497
export function changeToplevelTheme(currentTheme: Theme) {
  if (document && document.body instanceof HTMLBodyElement) {
    // Flow give error when directly assesing document.body.classList.[remove()]|[add()]
    const bodyClassList = document.body.classList;
    // we can't simply set the className because there can be other classes present
    // therefore we only remove & add those related to the theme
    const allThemes: Array<string> = Object.keys(THEMES).map(key => THEMES[key]);
    bodyClassList.remove(...allThemes);
    bodyClassList.remove('YoroiShelley');
    bodyClassList.add(currentTheme);

    // we used this theme for the Shelley version of the Yoroi extension
    // however, going forward, Yoroi will be a mono-project containing all sub-networks
    if (false) { // eslint-disable-line no-constant-condition
      bodyClassList.add('YoroiShelley');
    }
  }
}


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

const getCSSCustomPropObject:void => Object = () => {
  const allCSSVars = getCSSCustomPropIndex();
  const mapAllCssVars = allCSSVars.map(([cssVar, cssValue]) => ({
    [cssVar]: cssValue,
  }));
  return Object.assign({}, ...mapAllCssVars);
};

const readCssVar = (varName: string):string => {
  varName = varName.startsWith('--') ? varName : '--' + varName;
  return window.getComputedStyle(document.documentElement).getPropertyValue(varName);
};

const writeCssVar = (varName:string, value:any):void => {
  varName = varName.startsWith('--') ? varName : '--' + varName;
  document.documentElement?.style.setProperty(varName, value);
};

export { readCssVar, writeCssVar, getCSSCustomPropObject };
