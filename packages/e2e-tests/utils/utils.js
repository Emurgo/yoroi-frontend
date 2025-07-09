import { By } from 'selenium-webdriver';
import { dbSnapshotsDir, TargetBrowser, testRunDir } from '../helpers/constants.js';
import * as fs from 'node:fs';
import path from 'path';
import pkg from 'simple-node-logger';
import axios from 'axios';
const { createSimpleFileLogger } = pkg;

export function getMethod(locatorMethod) {
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
    default: {
      return By.css;
    }
  }
}

export const getByLocator = locator => getMethod(locator.method)(locator.locator);

export const getTargetBrowser = () => process.env.TARGETBROWSER;

export const isFirefox = () => getTargetBrowser() === TargetBrowser.FF;
export const isChrome = () => getTargetBrowser() === TargetBrowser.Chrome;
export const isBrave = () => getTargetBrowser() === TargetBrowser.Brave;

export const getCurrentOS = () => process.platform;
export const isLinux = () => getCurrentOS() === 'linux';
export const isMacOS = () => getCurrentOS() === 'darwin';
export const isHeadless = () => process.env.HEADLESS === 'true';
export const isDapp = () => process.env.ISDAPP === 'true';
export const isLocalRun = () => process.env.EXTENSION_LOCAL_RUN === 'true';

export const createTestRunDataDir = testSuiteName => {
  const clearedTestSuiteName = testSuiteName.replace(/[ |,]/gi, '_');
  const testsDataDir = testRunDir(getTargetBrowser());
  const fullPath = path.resolve(testsDataDir, clearedTestSuiteName);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
};

export const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const getTestLogger = (logFileName, dir) => {
  let testsDataDir = '';
  if (dir) {
    testsDataDir = createTestRunDataDir(dir);
  } else {
    testsDataDir = createTestRunDataDir(logFileName);
  }
  const clearedLogFileName = logFileName.replace(/[ |,]/gi, '_');
  const fullPath = path.resolve(testsDataDir, clearedLogFileName + '.log');
  const simpleLogger = createSimpleFileLogger(fullPath);
  return simpleLogger;
};

export const walletNameShortener = walletName => {
  if (walletName.length > 15) {
    return walletName.slice(0, 12) + '...';
  }
  return walletName;
};

export const checkIfElementsInArrayAreUnique = function (arr) {
  return new Set(arr).size === arr.length;
};

export const getCircularReplacer = () => {
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
};

export const getDownloadsDir = () => {
  const testRunDataDir = testRunDir(getTargetBrowser());
  const fullPath = path.resolve(testRunDataDir, 'downloads');
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  return fullPath;
};

export const getListOfDownloadedFiles = () => {
  const downloadsDir = getDownloadsDir();

  return fs.readdirSync(downloadsDir);
};

export const getFileContent = (fileName, fileDir) => {
  const fullPath = path.resolve(fileDir, fileName);
  const data = fs.readFileSync(fullPath, 'utf8');

  return data;
};

export const getDownloadedFileContent = fileName => {
  const fullPath = path.resolve(getDownloadsDir(), fileName);
  const data = fs.readFileSync(fullPath, 'utf8');

  return data;
};

export const cleanDownloads = () => {
  const allDownloadedFiles = getListOfDownloadedFiles();
  for (const fileName of allDownloadedFiles) {
    const fullPath = path.resolve(getDownloadsDir(), fileName);
    fs.unlinkSync(fullPath);
  }
};

/**
 * The function return the current date in the format "yyyy-mm-dd"
 * @returns {string}
 */
export const getTodayStr = () => {
  return getDateStr(0);
};

export const getDateStr = (daysFromToday = 0) => {
  const todayDateObj = new Date();
  const year = todayDateObj.getFullYear();
  const month = `0${todayDateObj.getMonth() + 1}`.slice(-2);
  const day = `0${todayDateObj.getDate() + daysFromToday}`.slice(-2);

  return `${year}-${month}-${day}`;
};

export const strNumberToNumber = strNumber => {
  let result = 0;
  if (strNumber !== '') {
    result = parseFloat(strNumber);
  }
  return result;
};

export const parseExportedCSV = fileContent => {
  const lines = fileContent.split('\n');
  const result = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    if (lineIndex === 0) {
      continue;
    }
    const rowData = lines[lineIndex].split(',');
    const cleanRowData = rowData.map(rowDatum => rowDatum.slice(1, -1));
    const [
      txType,
      inAmountString,
      ,
      outAmountString,
      ,
      feeAmountString,
      ,
      exchange,
      tradeGroup,
      comment,
      date,
      txHashId,
    ] = cleanRowData;
    if (comment.includes('Staking Reward Epoch')) {
      continue;
    }

    const inAmount = strNumberToNumber(inAmountString);
    const outAmount = strNumberToNumber(outAmountString);
    const feeAmount = strNumberToNumber(feeAmountString);

    result.push({
      txType,
      inAmount,
      outAmount,
      feeAmount,
      exchange,
      tradeGroup,
      comment,
      date,
      txHashId,
    });
  }
  return result;
};

/**
 *
 * @param {string} prettyDate Accepts a date parameter as a string in from "Today", "Yesterday", "March 11, 2024"
 * @returns {string} A date in the format "yyyy-mm-dd"
 */
export const convertPrettyDateToNormal = prettyDate => {
  if (prettyDate === 'Today') {
    return getDateStr(0);
  }
  if (prettyDate === 'Yesterday') {
    return getDateStr(-1);
  }

  const todayDateObj = new Date(prettyDate);
  const year = todayDateObj.getFullYear();
  const month = `0${todayDateObj.getMonth() + 1}`.slice(-2);
  const day = `0${todayDateObj.getDate()}`.slice(-2);

  return `${year}-${month}-${day}`;
};

const uglyDateToDateObject = uglyDateStr => {
  const yearStr = uglyDateStr.slice(-4);
  const monthStr = uglyDateStr.slice(0, 2);
  const dayStr = uglyDateStr.slice(2, 4);
  return new Date(`${yearStr}-${monthStr}-${dayStr}`);
};

export const groupDateIsInPeriod = (groupDate, startDate, endDate) => {
  const groupDateObject = new Date(groupDate);
  const startDateObject = uglyDateToDateObject(startDate);
  const endDateObject = uglyDateToDateObject(endDate);
  return startDateObject <= groupDateObject && groupDateObject <= endDateObject;
};

export const convertPrettyTimeToNormal = prettyTime => {
  const [time, modifier] = prettyTime.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  return `${hours}:${minutes}:00`;
};

export const roundUpCurrency = (value, fiatCurrency) => {
  const cryptoFiats = ['ETH', 'BTC'];
  if (cryptoFiats.includes(fiatCurrency)) {
    return Number(parseFloat(value).toFixed(6));
  } else {
    return Number(parseFloat(value).toFixed(2));
  }
};

export const diffIsLessPerc = (valueA, valueB, percDiff) => {
  const valueA1Perc = valueA * (percDiff / 100);
  return valueB >= valueA - valueA1Perc && valueB <= valueA + valueA1Perc;
};

/**
 * Getting a JS object from json files stored in the snapshots folder
 * @param {string} dbSnapshotName
 * @param {boolean} useGeneralStorageInfo
 * @returns {Object}
 */
export const getSnapshotObjectFromJSON = (dbSnapshotName, useGeneralStorageInfo) => {
  const dbSnapshotPath = path.resolve(dbSnapshotsDir, dbSnapshotName);
  const fileContent = getFileContent(dbSnapshotPath);
  if (useGeneralStorageInfo) {
    return JSON.parse(fileContent);
  }
  const generalSnapshotName = 'general.browserLocalStorage.json';
  const generalSnapshotPath = path.resolve(dbSnapshotsDir, generalSnapshotName);
  const generalFileContent = getFileContent(generalSnapshotPath);
  const joinedObject = Object.assign(JSON.parse(generalFileContent), JSON.parse(fileContent));
  return joinedObject;
};

export const getCurrenciesPrices = async () => {
  try {
    const reqResponse = await axios.get(
      'https://iohk-mainnet.yoroiwallet.com/api/price/ADA/current'
    );
    return reqResponse.data.ticker.prices;
  } catch (error) {
    throw new Error(`Error happen while getting currencies prices. Error: ${error}`);
  }
};

/**
 * Getting a random item from the array
 * @template T - Type of an element of the array
 * @param {T[]} arr - Array of T elements
 * @returns {T} - A random element of T type
 */
export const getRandomItem = arr => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};
