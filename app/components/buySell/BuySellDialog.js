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
import VerifyIcon from '../../assets/images/verify-icon.inline.svg'
import { Logger, stringifyError } from '../../utils/logging'
import VerticallyCenteredLayout from '../layout/VerticallyCenteredLayout'
import LoadingSpinner from '../widgets/LoadingSpinner'

const messages = defineMessages({
  dialogTitle: {
    id: 'buysell.dialog.title',
    defaultMessage: '!!!Buy / Sell ADA',
  },
  dialogSelectAddress: {
    id: 'buysell.dialog.selectAddress',
    defaultMessage: '!!!Please select the receiving address. This will be shared with the third party provider called Changelly for the buy / sell of ADA. ',
  },
  dialogDescription: {
    id: 'buysell.dialog.instructions',
    defaultMessage: '!!!Please select your preferences. On the next screen, confirm your selection by pressing the green arrow on the top right',
  },
  dialogManual: {
    id: 'buysell.dialog.manual',
    defaultMessage: '!!!I will add my address manually',
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
  walletList: ?array<WalletInfo>,
|};

@observer
export default class BuySellDialog extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    addressSelected: null,
    walletList: null,
  };

  createRows: ($npm$ReactIntl$IntlFormat, array<WalletInfo>) => Node = (intl, wallets) => (
    wallets.map((wallet) => {
      return (
        <div className={styles.row}>
          <div className={styles.left}>
            <div className={styles.nameAndCurrency}>
              { wallet.currencyName ? `(${wallet.currencyName}) ` : ''}{wallet.walletName}
            </div>
            <div className={styles.address}>
              {truncateAddress(wallet.anAddressFormatted)}
            </div>
          </div>
          <div className={styles.right}>
            {/* Verify Address action */}
            <button
              type="button"
              onClick={() =>
                this.setState({ addressSelected: wallet.anAddressFormatted })
              }
            >
              <div>
                <span className={styles.verifyIcon}>
                  <VerifyIcon />
                </span>
              </div>
            </button>
            {/* Action block end */}
          </div>
        </div>
      )
    })
  )

  render(): Node {
    const { intl } = this.context;

    if (this.state.walletList == null) {
      this.props.walletList()
        // eslint-disable-next-line promise/always-return
        .then((resp) => {
          const wallets = [
            ...resp,
            {
              walletName: intl.formatMessage(messages.dialogManual),
              currencyName: '',
              anAddressFormatted: '',
            }
          ]
          this.setState({ walletList: wallets })
        })
        .catch((error) => {
          Logger.error(`${nameof(BuySellDialog)}::${nameof(this.props.walletList)} error: ` + stringifyError(error));
          throw error;
        })

      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }
    if (this.state.addressSelected == null) {
      const addressNodes = this.createRows(intl, this.state.walletList);

      return (
        <Dialog
          title={intl.formatMessage(messages.dialogTitle)}
          closeOnOverlayClick={false}
          onClose={this.props.onCancel}
          closeButton={<DialogCloseButton />}
          className=""
        >
          <div className={styles.content}>
            {intl.formatMessage(messages.dialogSelectAddress)}
            {addressNodes}
          </div>
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
