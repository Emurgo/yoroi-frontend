// @flow
import BigNumber from 'bignumber.js';
import { MAX_MEMO_SIZE } from '../config/externalStorageConfig';
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import { defineMessages, } from 'react-intl';
import type { NetworkRow, TokenRow } from '../api/ada/lib/storage/database/primitives/tables';
import { getCardanoHaskellBaseConfig, isCardanoHaskell } from '../api/ada/lib/storage/database/prepackaged/networks';
import { getTokenName } from '../stores/stateless/tokenHelpers';
import { truncateToken } from './formatters';

export const isValidWalletName: string => boolean = (walletName) => {
  const nameLength = walletName.length;
  return nameLength >= 1 && nameLength <= 40;
};

export const isValidPaperPassword: string => boolean = (paperPassword) => (
  isValidWalletPassword(paperPassword)
);

export const isValidWalletPassword: string => boolean = (walletPassword) => (
  /**
   * No special character requirement: https://xkcd.com/936/
   *
   * We pick 10 letters as the requirement because Daedalus password requirements are:
   * - 10 characters long
   * - 1 uppercase
   * - 1 lowercase
   * - 1 number
   *
   * Since with Shelley both Yoroi and Daedalus use the same mnemonic scheme,
   * many users may have the same wallet in both Daedalus and Yoroi
   * It's easier if we allow them to also have the same password in this case.
   */
  walletPassword.length >= 10
);

export const isValidRepeatPassword: (string, string) => boolean = (
  walletPassword,
  repeatPassword
) => walletPassword === repeatPassword;

export const isValidMemo: string => boolean = (memo) => (
  memo !== ''
  && memo.length <= MAX_MEMO_SIZE
);

export const isValidMemoOptional: string => boolean = (memo) => (
  memo.length <= MAX_MEMO_SIZE
);

export const isWithinSupply: (string, BigNumber) => boolean = (value, totalSupply) => {
  const numericValue = new BigNumber(value);
  return numericValue.isFinite()
    && numericValue.gte(1)
    && numericValue.lte(totalSupply);
};

export async function validateAmount(
  amount: BigNumber,
  tokenRow: $ReadOnly<TokenRow>,
  minAmount: BigNumber,
  formatter: $npm$ReactIntl$IntlFormat,
): Promise<[boolean, void | string]> {
  const messages = defineMessages({
    invalidAmount: {
      id: 'wallet.send.form.errors.invalidAmount',
      defaultMessage: '!!!Invalid amount. Please retype.',
    },
    tooSmallUtxo: {
      id: 'wallet.send.form.errors.tooSmallUtxo',
      defaultMessage: '!!!{minUtxo} {ticker} is minimum.',
    },
  });

  // some Rust stuff could overflow after 2^63 - 1
  if (amount.gt(new BigNumber(2).pow(63).minus(1))) {
    return [false, formatter.formatMessage(messages.invalidAmount)]
  }

  // don't validate this for tokens since they have no minimum
  if (!tokenRow.IsDefault) return [true, undefined];

  if (amount.lt(minAmount)) {
    return [
      false,
      formatter.formatMessage(messages.tooSmallUtxo, {
        minUtxo: minAmount.div(new BigNumber(10).pow(tokenRow.Metadata.numberOfDecimals)),
        ticker: truncateToken(getTokenName(tokenRow)),
      })
    ];
  }
  return [true, undefined];
}

export function getMinimumValue(
  network: $ReadOnly<NetworkRow>,
  isToken: boolean,
): BigNumber {
  if (isToken) {
    // when sending a token, Yoroi will handle making sure the minimum value is in the UTXO
    return new BigNumber(0);
  }
  if (isCardanoHaskell(network)) {
    const config = getCardanoHaskellBaseConfig(network)
      .reduce((acc, next) => Object.assign(acc, next), {});
    return new BigNumber(config.MinimumUtxoVal);
  }
  return new BigNumber(0);
}
