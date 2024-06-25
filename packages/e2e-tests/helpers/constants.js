import path from 'path';
import { fileURLToPath } from 'url';
import { isMacOS } from '../utils/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __englishCharacters = 'qwertyuiopasdfghjklzxcvbnm';
const __digits = '1234567890';
const __getRandomItem = arr => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  const item = arr[randomIndex];

  return item;
};
const __flipCoin = () => {
  const trueFalseArr = [true, false];
  const randomIndex = Math.floor(Math.random() * trueFalseArr.length);
  return trueFalseArr[randomIndex];
};
const __getRandomChar = isCapital => {
  let randomChar = '';
  if (isCapital) {
    randomChar = __flipCoin()
      ? __getRandomItem(__englishCharacters + __digits).toUpperCase()
      : __getRandomItem(__englishCharacters + __digits);
  } else {
    randomChar = __getRandomItem(__englishCharacters + __digits);
  }
  return randomChar;
};
const __genString = (stringLength, startPart = '', withCapitals = false) => {
  const numOfLettersToAdd = stringLength - startPart.length;
  let tempString = `${startPart}`;
  for (let index = 0; index < numOfLettersToAdd; index++) {
    const randomCharacter = __getRandomChar(withCapitals);
    tempString = tempString + randomCharacter;
  }
  return tempString;
};

export const getTestString = (basePart, stringLength, withCapitals) => {
  if (!stringLength) {
    return basePart;
  }
  if (stringLength <= basePart.length) {
    return __genString(stringLength, '', withCapitals);
  }
  return __genString(stringLength, basePart, withCapitals);
};

export const DRIVERS_AMOUNT = 1;
export const chromeExtIdUrl = `chrome-extension://bdlknlffjjmjckcldekkbejaogpkjphg`;
export const firefoxExtensionId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
export const firefoxExtIdUrl = `moz-extension://${firefoxExtensionId}`;
export const firefoxUuidMapping = `{"{530f7c6c-6077-4703-8f71-cb368c663e35}":"${firefoxExtensionId}"}`;
export const firefoxBin =
  process.env.FIREFOX_BIN != null
    ? process.env.FIREFOX_BIN
    : '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox-bin';
export const chromeBin = isMacOS()
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : '/snap/bin/chromium.chromedriver';
export const TargetBrowser = Object.freeze({
  Chrome: 'chrome',
  Brave: 'brave',
  FF: 'firefox',
});
export const WalletWordsSize = Object.freeze({
  Shelley: 15,
  Daedalus: 24,
});
export const adaInLovelaces = 1000000;

export const projectRootDir = path.resolve(__dirname, '..');

export const dbSnapshotsDir = path.resolve(projectRootDir, 'helpers', 'wallet-dbSnapshots');

export const testRunDir = browserName =>
  path.resolve(__dirname, '..', `testRunsData_${browserName}`);

export const getTestWalletName = (walletNameLength = 0, withCapitals = false) => {
  let basePart = 'test';
  return getTestString(basePart, walletNameLength, withCapitals);
};

export const getPassword = (walletNameLength = 0, withCapitals = false) => {
  let basePart = 'qwerty1234';
  return getTestString(basePart, walletNameLength, withCapitals);
};
export const yoroiObject = Object.freeze({
  name: 'yoroi',
  apiVersion: '0.3.0',
  icon:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNjMiIHZpZXdCb3g9IjAgMCA3MiA2MyIgZmlsbD0ibm' +
    '9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExODRfODQyND' +
    'ApIj4KPHBhdGggZD0iTTU1LjYyNzEgNDguOTEzNkw0OS45MjEgNTIuODcxMkw3LjkwMjMyIDIzLjg2MjNDNy45MDIzMiAyMy44MD' +
    'U2IDcuOTAyMzIgMjMuNzQ4OCA3Ljg4NTYgMjMuNjkyVjIxLjEwMzdDNy44ODU2IDIwLjI2NDMgNy44ODU2IDE5LjQyNjEgNy44OD' +
    'U2IDE4LjU4ODlWMTUuOTUzOUw1NS42MjcxIDQ4LjkxMzZaTTQzLjkwMDYgMTEuNDc1M0M0MS4zNjM1IDEzLjIxMTkgMzguODAyOS' +
    'AxNC45MTUyIDM2LjI2NTggMTYuNjUxOUMzNi4xMzk2IDE2Ljc2NjYgMzUuOTc1MSAxNi44MzAyIDM1LjgwNDQgMTYuODMwMkMzNS' +
    '42MzM4IDE2LjgzMDIgMzUuNDY5MyAxNi43NjY2IDM1LjM0MzEgMTYuNjUxOUMzMi4yMDc2IDE0LjQ3MSAyOS4wNTU0IDEyLjMxMD' +
    'IgMjUuOTE2NSAxMC4xNDYxQzIyLjYxMzkgNy44NTUwMyAxOS4zMTM0IDUuNTU3MyAxNi4wMTUyIDMuMjUyODlMMTEuMzMyIDBIME' +
    'MwLjYwMTY5OSAwLjQyMDgwNSAxLjA5NjQzIDAuNzc0ODE2IDEuNTk0NSAxLjExODgxTDEwLjQ3NjMgNy4yNzA1OEMxMy40MDQ1ID' +
    'kuMzA1NTkgMTYuMzMxNyAxMS4zNDA2IDE5LjI1NzcgMTMuMzc1NkMyMi4wMTIyIDE1LjI4OTMgMjQuNzU5OSAxNy4yMTI5IDI3Lj' +
    'UxNzcgMTkuMTIzM0MzMC4xMzUxIDIwLjkzNjcgMzIuNzU5MiAyMi43MzAyIDM1LjM3NjYgMjQuNTQ3QzM1LjQ4MjMgMjQuNjQyNy' +
    'AzNS42MTk5IDI0LjY5NTggMzUuNzYyNyAyNC42OTU4QzM1LjkwNTQgMjQuNjk1OCAzNi4wNDMgMjQuNjQyNyAzNi4xNDg4IDI0Lj' +
    'U0N0MzOC4yNjE0IDIzLjEwMDkgNDAuMzk3NCAyMS42NzgyIDQyLjUgMjAuMjMyMUM0Ny43MzI2IDE2LjY0OTYgNTIuOTYwNyAxMy' +
    '4wNjE3IDU4LjE4NDMgOS40NjgxMkw2OS42MDMyIDEuNjY5ODZDNzAuMzkyMSAxLjEzMjE3IDcxLjE3NzcgMC41ODQ0NTIgNzIgME' +
    'g2MC42MzQ2QzU1LjA1NDQgMy44MjI4NyA0OS40NzY0IDcuNjQ3OTcgNDMuOTAwNiAxMS40NzUzWk03Ljk0NTc3IDM1LjI0NzRDNy' +
    '45MjA5NyAzNS4yOTU1IDcuOTAwODIgMzUuMzQ1OCA3Ljg4NTYgMzUuMzk3N1Y0MC4xNTM1QzcuODg1NiA0MS4xMDIgNy44ODU2ID' +
    'QyLjA1MDUgNy44ODU2IDQyLjk5NTZDNy44ODgxNCA0My4wNTMzIDcuOTAxNzYgNDMuMTEgNy45MjU3MiA0My4xNjI2TDM1Ljk3MT' +
    'YgNjIuNTMzSDM1Ljk5ODNMNDEuNzA0NCA1OC41Nzg4TDcuOTQ1NzcgMzUuMjQ3NFpNNjMuOTc0IDE1Ljk3MDZMNDMuMTAxNyAzMC' +
    '4zOTE1QzQzLjE2NzYgMzAuNDgwNCA0My4yNDE1IDMwLjU2MzEgNDMuMzIyMyAzMC42Mzg2QzQ1LjA4NzMgMzEuODg3NyA0Ni44NT' +
    'M0IDMzLjEzMTIgNDguNjIwNiAzNC4zNjkxQzQ4LjY3ODkgMzQuNDAwNCA0OC43NDU3IDM0LjQxMjEgNDguODExMiAzNC40MDI1TD' +
    'YzLjkyMzkgMjMuOTQ5MkM2My45NDY2IDIzLjkwNDggNjMuOTYzNCAyMy44NTc2IDYzLjk3NCAyMy44MDg5VjE1Ljk3MDZaTTYzLj' +
    'k5MDcgMzUuNTUxNEM2MS42MjA3IDM3LjE4NDUgNTkuMzM0MiAzOC43NjQyIDU3LjAyMSA0MC4zNjM5TDYyLjQ0MyA0NC4yMDQ2TD' +
    'YzLjk5MDcgNDMuMTMyNVYzNS41NTE0WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzExODRfODQyNDApIi8+CjwvZz4KPGRlZn' +
    'M+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMTg0Xzg0MjQwIiB4MT0iOS4xNTU4NiIgeTE9IjQ0LjM4NDkiIH' +
    'gyPSI2Mi43NDE3IiB5Mj0iLTkuMjQ5ODQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj' +
    '0iIzFBNDRCNyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0NzYwRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaX' +
    'BQYXRoIGlkPSJjbGlwMF8xMTg0Xzg0MjQwIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjYyLjUyNjMiIGZpbGw9IndoaXRlIi' +
    '8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==',
});

export const Colors = Object.freeze({
  errorRed: 'rgb(255, 19, 81)',
});
