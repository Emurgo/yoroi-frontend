// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import { truncateAddress } from '../../utils/formatters';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import ChangellyFetcher from './ChangellyFetcher'

import styles from './BuySellDialog.scss';

const messages = defineMessages({
  dialogTitle: {
    id: 'buysell.dialog.title',
    defaultMessage: '!!!Buy / Sell ADA',
  },
  dialogDescription: {
    id: 'buysell.dialog.description',
    defaultMessage: '!!!Cardano is the first provably secure proof of stake protocol',
  },
});

type WalletInfo = {|
  walletName: string,
  currencyName: string,
  anAddressFormatted: string,
|}

type Props = {|
  +onCancel: void => void,
  +walletList: () => Promise<array<WalletInfo>>
|};

const WIDGET_URL = 'https://widget.changelly.com?from=*&to=*&amount=200&fromDefault=usd&toDefault=ada&theme=default&merchant_id=g9qheu8vschp16jj&payment_id=&v=3'

type State = {|
  addressSelected: ?string,
|};

@observer
export default class BuySellDialog extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    addressSelected: null,
  };

  createRows: array<WalletInfo> => Node = (wallets) => (
    wallets.map((wallet) => {
      return (
        <li key={wallet.walletName}>
          <div className={styles.content}>
            <div className={styles.row}>
              <div className={styles.left}>
                <div className={styles.nameAndCurrency}>
                  ({wallet.currencyName}) {wallet.walletName}
                </div>
                <div className={styles.address}>
                  {truncateAddress(wallet.anAddressFormatted)}
                </div>
              </div>
              <div className={styles.right}>
                <button
                  type="button"
                  className={styles.selectAddress}
                  onClick={() => {
                    this.state.addressSelected = wallet.anAddressFormatted
                    console.log('address selected')
                    console.log(this.state.addressSelected)
                  }}
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </li>
      )
    })
  )

  render(): Node {
    const { intl } = this.context;

    console.log('Wallet list')
    console.log(this.props.walletList())
    // &address=AAAAAAA

    const result = [
       {
         walletName: 'Nico Ergo Test',
         currencyName: 'ERG',
         anAddressFormatted: '9gvvnszDQV3BMDfh4kPcuWXrUmuCRqgT2fuqQ2TZDK6kQZaW6K2'
       },
       {
         walletName: 'Nico Test Empty Ergo',
         currencyName: 'ERG',
         anAddressFormatted: '9emv7LAtw7U6xMs4JrJP8NTPvwQjNRaSWpgSTGEM6947fFofBWd'
       },
       {
         walletName: 'Nico Testnet',
         currencyName: 'TADA',
         anAddressFormatted: 'addr_test1vzddgtdqxmsvn0rqp0ltdfpddudvf76qs3esyn3zqf44drsv4avcs'
       },
       {
         walletName: 'Nico Test Mainnet',
         currencyName: 'ADA',
         anAddressFormatted: 'addr1vxddgtdqxmsvn0rqp0ltdfpddudvf76qs3esyn3zqf44drshafsh4'
       }
    ]

    if (this.state.addressSelected == null) {
      const addressNodes = this.createRows(result);

      return (
        <Dialog
          title={intl.formatMessage(messages.dialogTitle)}
          closeOnOverlayClick={false}
          onClose={this.props.onCancel}
          closeButton={<DialogCloseButton />}
          className=""
        >
          {addressNodes}
        </Dialog>
      )
    }

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        closeButton={<DialogCloseButton />}
        className=""
      >
        <div className={styles.component}>
          <div className={styles.description}>
            {intl.formatMessage(messages.dialogDescription)}
            {this.props.walletList}
          </div>
          <ChangellyFetcher widgetURL={WIDGET_URL} address={this.state.addressSelected} />
        </div>
      </Dialog>
    );
  }
}
