// @flow

import { isCardanoHaskell } from '../api/ada/lib/storage/database/prepackaged/networks';
import { Bip44Wallet } from '../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { isLedgerNanoWallet, isTrezorTWallet } from '../api/ada/lib/storage/models/ConceptualWallet';
import globalMessages from '../i18n/global-messages';
import { ReactComponent as ConceptualIcon }  from '../assets/images/wallet-nav/conceptual-wallet.inline.svg';
import { ReactComponent as TrezorIcon }  from '../assets/images/wallet-nav/trezor-wallet.inline.svg';
import { ReactComponent as LedgerIcon }  from '../assets/images/wallet-nav/ledger-wallet.inline.svg';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import type { ConceptualWallet } from '../api/ada/lib/storage/models/ConceptualWallet/index';

export const getEra:
    ConceptualWallet => void | $Exact<$npm$ReactIntl$MessageDescriptor> = wallet => {
    if (!isCardanoHaskell(wallet.getNetworkInfo())) {
        return undefined;
    }
    if (wallet instanceof Bip44Wallet) {
        return globalMessages.byronLabel;
    }
    return globalMessages.shelleyLabel;
};

export const getType: ConceptualWallet => $Exact<$npm$ReactIntl$MessageDescriptor> = wallet => {
    if (isLedgerNanoWallet(wallet)) {
      return globalMessages.ledgerWallet;
    }
    if (isTrezorTWallet(wallet)) {
      return globalMessages.trezorWallet;
    }
    return globalMessages.standardWallet;
};

export const getIcon: ConceptualWallet => string = wallet => {
    if (isLedgerNanoWallet(wallet)) {
      return LedgerIcon;
    }
    if (isTrezorTWallet(wallet)) {
      return TrezorIcon;
    }
    return ConceptualIcon;
};