//@flow 

import { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { isCardanoHaskell } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { isLedgerNanoWallet, isTrezorTWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';
import globalMessages from '../../i18n/global-messages';

const messages = defineMessages({
    standardWallet: {
      id: 'wallet.nav.type.standard',
      defaultMessage: '!!!Standard wallet',
    },
    paperWallet: {
      id: 'wallet.nav.type.paper',
      defaultMessage: '!!!Paper wallet',
    },
    trezorWallet: {
      id: 'wallet.nav.type.trezor',
      defaultMessage: '!!!Trezor wallet',
    },
    ledgerWallet: {
      id: 'wallet.nav.type.ledger',
      defaultMessage: '!!!Ledger wallet',
    },
});

export default class WalletType extends Component<Props> {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    getEra: ConceptualWallet => (void | $Exact<$npm$ReactIntl$MessageDescriptor>) = (wallet) => {
        if (!isCardanoHaskell(wallet.getNetworkInfo())) {
          return undefined;
        }
        if (wallet instanceof Bip44Wallet) {
          return globalMessages.byronLabel;
        }
        return undefined;
    }
    getType: ConceptualWallet => $Exact<$npm$ReactIntl$MessageDescriptor> = (wallet) => {
        if (isLedgerNanoWallet(wallet)) {
            return messages.ledgerWallet;
        }
        if (isTrezorTWallet(wallet)) {
            return messages.trezorWallet;
        }
        return messages.standardWallet;
    }

    render() {
        const { intl } = this.context;
        const typeText = [
            this.getEra(this.props.wallet),
            this.getType(this.props.wallet),
          ]
            .filter(text => text != null)
            .map(text => intl.formatMessage(text))
            .join(' - ');
        return typeText
    }
}