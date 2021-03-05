// @flow

import ErgoWalletsActions from './ergo-wallets-actions';

export type ErgoActionsMap = {|
  wallets: ErgoWalletsActions,
|};

const ergoActionsMap: ErgoActionsMap = Object.freeze({
  wallets: new ErgoWalletsActions(),
});

export default ergoActionsMap;
