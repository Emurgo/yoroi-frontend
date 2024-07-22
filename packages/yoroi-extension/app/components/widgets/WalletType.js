// @flow

import { Component } from 'react';
import type { Node } from 'react'
import globalMessages from '../../i18n/global-messages';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { WalletType as WalletT } from '../../../chrome/extension/background/types';

type Props = {|
    walletType: WalletT,
|}
export default class WalletType extends Component<Props> {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    getType: WalletT => $Exact<$npm$ReactIntl$MessageDescriptor> = (walletType) => {
        if (walletType === 'ledger') {
          return globalMessages.ledgerWallet;
        }
        if (walletType === 'trezor') {
          return globalMessages.trezorWallet;
        }
        return globalMessages.standardWallet;
    }

    render(): Node {
        const { intl } = this.context;
        const typeText = intl.formatMessage(this.getType(this.props.walletType));
        return <span>{typeText}</span>
    }
}
