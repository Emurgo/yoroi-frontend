// @flow

import { BigNumber } from 'bignumber.js';

export type TokenLookupKey = {|
  +identifier: string,
  /**
   * note: avoid putting asset metadata here directly
   * since it can update over time so best not to cache it here
   */
  +networkId: number,
|};

export type TokenEntry = {|
  ...TokenLookupKey,
  +amount: BigNumber,
|};

export type DefaultTokenEntry = {|
  +defaultNetworkId: number,
  +defaultIdentifier: string,
|};

export class MultiToken {
  // this could be a map, but the # of elements is small enough the perf difference is trivial
  values: Array<TokenEntry>;
  defaults: DefaultTokenEntry;

  static from(multiTokenData: {|
    values: Array<{| identifier: string, networkId: number, amount: string |}>,
    defaults: DefaultTokenEntry,
  |}): MultiToken {
    return new MultiToken(
      multiTokenData.values.map(({ identifier, networkId, amount }) => ({
        identifier,
        networkId,
        amount: new BigNumber(amount),
      })),
      multiTokenData.defaults
    );
  }

  constructor(values: Array<TokenEntry>, defaults: DefaultTokenEntry) {
    this.values = [];

    // things are just easier if we enforce the default entry to be part of the list of tokens
    this.defaults = Object.freeze(defaults);
    this.add({
      identifier: defaults.defaultIdentifier,
      networkId: defaults.defaultNetworkId,
      amount: new BigNumber(0),
    });
    values.forEach(value => this.add(value));
  }

  getDefaults(): DefaultTokenEntry {
    return this.defaults;
  }

  _checkNetworkId: number => void = networkId => {
    const ownNetworkId = this.defaults.defaultNetworkId;
    if (ownNetworkId !== networkId) {
      throw new Error(`${nameof(MultiToken)} network mismatch ${ownNetworkId} - ${networkId}`);
    }
  };

  get: string => BigNumber | void = identifier => {
    return this.values.find(value => value.identifier === identifier)?.amount;
  };

  /**
   * Creates a token entry with the network of the default token
   */
  createEntry: (string, BigNumber) => TokenEntry = (identifier, amount) => {
    return {
      networkId: this.getDefaults().defaultNetworkId,
      identifier,
      amount,
    };
  }

  /**
   * Creates a token entry with the network and the identifier of the default token
   */
  createDefaultEntry: (BigNumber) => TokenEntry = (amount) => {
    return this.createEntry(this.getDefaults().defaultIdentifier, amount);
  }

  add: TokenEntry => MultiToken = entry => {
    this._checkNetworkId(entry.networkId);
    const existingEntry = this.values.find(value => value.identifier === entry.identifier);
    if (existingEntry == null) {
      this.values.push(entry);
      return this;
    }
    existingEntry.amount = existingEntry.amount.plus(entry.amount);
    this._removeIfZero(entry.identifier);
    return this;
  };

  /**
   * Add the entry amount but remove in case the value is equal or below zero
   */
  addWithLimitZero: TokenEntry => MultiToken = entry => {
    this._checkNetworkId(entry.networkId);
    const existingEntry = this.values.find(value => value.identifier === entry.identifier);
    if (existingEntry == null) {
      this.values.push(entry);
      return this;
    }
    existingEntry.amount = existingEntry.amount.plus(entry.amount);
    this._removeIfZeroOrBelow(entry.identifier);
    return this;
  };

  _removeIfZero: string => void = identifier => {
    // if after modifying a token value we end up with a value of 0,
    // we should just remove the token from the list
    // However, we must keep a value of 0 for the default entry
    if (identifier === this.defaults.defaultIdentifier) {
      return;
    }
    const existingValue = this.get(identifier);
    if (existingValue != null && existingValue.eq(0)) {
      this.values = this.values.filter(value => value.identifier !== identifier);
    }
  };

  _removeIfZeroOrBelow: string => void = identifier => {
    // if after modifying a token value we end up with a value of 0,
    // we should just remove the token from the list
    // However, we must keep a value of 0 for the default entry
    if (identifier === this.defaults.defaultIdentifier) {
      return;
    }
    const existingValue = this.get(identifier);
    if (existingValue != null && existingValue.lte(0)) {
      this.values = this.values.filter(value => value.identifier !== identifier);
    }
  };

  subtract: TokenEntry => MultiToken = entry => {
    return this.add({
      identifier: entry.identifier,
      amount: entry.amount.negated(),
      networkId: entry.networkId,
    });
  };

  /**
   * Subtract the specified entry from this multitoken,
   * but remove the entry in case it's zero or below
   */
  subtractWithLimitZero: TokenEntry => MultiToken = entry => {
    return this.addWithLimitZero({
      identifier: entry.identifier,
      amount: entry.amount.negated(),
      networkId: entry.networkId,
    });
  };

  joinAddMutable: MultiToken => MultiToken = target => {
    for (const entry of target.values) {
      this.add(entry);
    }
    return this;
  };
  joinSubtractMutable: MultiToken => MultiToken = target => {
    for (const entry of target.values) {
      this.subtract(entry);
    }
    return this;
  };
  /**
   * Subtract the specified multitoken from this multitoken,
   * remove any entries that are zero or below
   */
  joinSubtractMutableWithLimitZero: MultiToken => MultiToken = target => {
    for (const entry of target.values) {
      this.subtractWithLimitZero(entry);
    }
    return this;
  };
  joinAddCopy: MultiToken => MultiToken = target => {
    const copy = new MultiToken(this.values, this.defaults);
    return copy.joinAddMutable(target);
  };
  joinSubtractCopy: MultiToken => MultiToken = target => {
    const copy = new MultiToken(this.values, this.defaults);
    return copy.joinSubtractMutable(target);
  };

  /**
   * Subtract the specified multitoken from a new copy of this multitoken,
   * remove any entries that are zero or below
   */
  joinSubtractCopyWithLimitZero: MultiToken => MultiToken = target => {
    const copy = new MultiToken(this.values, this.defaults);
    return copy.joinSubtractMutableWithLimitZero(target);
  };

  absCopy: void => MultiToken = () => {
    return new MultiToken(
      this.values.map(token => ({ ...token, amount: token.amount.absoluteValue() })),
      this.defaults
    );
  };

  negatedCopy: void => MultiToken = () => {
    return new MultiToken(
      this.values.map(token => ({ ...token, amount: token.amount.negated() })),
      this.defaults
    );
  };

  getDefault: void => BigNumber = () => {
    return this.getDefaultEntry().amount;
  };

  getDefaultEntry: void => TokenEntry = () => {
    return this.values.filter(
      value =>
        value.networkId === this.defaults.defaultNetworkId &&
        value.identifier === this.defaults.defaultIdentifier
    )[0];
  };

  nonDefaultEntries: void => Array<TokenEntry> = () => {
    return this.values.filter(
      value =>
        !(
          value.networkId === this.defaults.defaultNetworkId &&
          value.identifier === this.defaults.defaultIdentifier
        )
    );
  };

  asMap: void => Map<string, BigNumber> = () => {
    return new Map(this.values.map(value => [value.identifier, value.amount]));
  };

  entries: void => Array<TokenEntry> = () => {
    return [...this.values];
  }

  isEqualTo: MultiToken => boolean = tokens => {
    const remainingTokens = this.asMap();

    // remove tokens that match <identifier, amount> one at a time
    // if by the end there are no tokens left, it means we had a perfect match
    for (const token of tokens.values) {
      const value = remainingTokens.get(token.identifier);
      if (value == null) return false;
      if (!value.isEqualTo(token.amount)) return false;
      remainingTokens.delete(token.identifier);
    }
    if (remainingTokens.size > 0) return false;
    return true;
  };

  size: void => number = () => this.values.length;

  isEmpty: void => boolean = () => {
    return this.values.some(token => token.amount.gt(0)) === false;
  };

  toString: () => string = () => {
    const defAmount = this.getDefault().toString();
    const assetMap = this.nonDefaultEntries().reduce(
      (acc, { identifier, amount }) => ({ ...acc, [identifier]: amount }),
      {}
    );
    return `${nameof(MultiToken)}{amount=${defAmount}, assets=${JSON.stringify(assetMap)}}`;
  };
}
