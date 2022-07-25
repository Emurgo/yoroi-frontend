// @flow

import { By } from 'selenium-webdriver';

export const checkIfElementsInArrayAreUnique = function (arr: Array<string>): boolean {
  return new Set(arr).size === arr.length;
};

export function getMethod(
  locatorMethod: string
): function {
  switch (locatorMethod) {
    case 'id': {
      return By.id;
    }
    case 'xpath': {
      return By.xpath;
    }
    case 'name': {
      return By.name;
    }
    case 'className': {
      return By.className;
    }
    case 'linkText': {
      return By.linkText;
    }
    case 'js': {
      return By.js;
    }
    case 'partialLinkText': {
      return By.partialLinkText;
    }
    case 'tagName': {
      return By.tagName;
    }
    default: {
      return By.css;
    }
  }
}

export function getLogDate(): string {
  return new Date().toISOString().replace(/:/g, '_');
}

export function getCircularReplacer(): Object {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}