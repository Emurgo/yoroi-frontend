// @flow

import { Component } from 'react';
import type { Node } from 'react'
import { isCardanoHaskell } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import globalMessages from '../../i18n/global-messages';
import { ConceptualWallet, isLedgerNanoWallet, isTrezorTWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ConceptualWalletSettingsCache } from '../../stores/toplevel/WalletSettingsStore';

type Props = {|
    wallet: ConceptualWalletSettingsCache,
|}
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
          return globalMessages.ledgerWallet;
        }
        if (isTrezorTWallet(wallet)) {
          return globalMessages.trezorWallet;
        }
        return globalMessages.standardWallet;
    }

    render(): Node {
        const { intl } = this.context;
        const typeText = [
          this.getEra(this.props.wallet.conceptualWallet),
          this.getType(this.props.wallet.conceptualWallet),
        ]
          .filter(text => text != null)
          .map(text => intl.formatMessage(text))
          .join(' - ');
        return <span>{typeText}</span>
    }
}