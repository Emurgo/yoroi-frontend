// @flow

import { By, Key } from 'selenium-webdriver';
import { recoveryPhraseField } from '../../pages/restoreWalletPage';

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

export async function enterRecoveryPhrase(customWorld: any, phrase: string) {

  const recoveryPhrase = phrase.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const recoveryPhraseElement = await customWorld.findElement(recoveryPhraseField);
    await recoveryPhraseElement.sendKeys(recoveryPhrase[i], Key.RETURN);
    if (i === 0) await customWorld.driver.sleep(500);
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