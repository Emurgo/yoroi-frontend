// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import { truncateAddress } from '../../utils/formatters';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import ChangellyFetcher from './ChangellyFetcher';

import styles from './BuySellDialog.scss';
import { ReactComponent as VerifyIcon } from '../../assets/images/verify-icon.inline.svg';
import VerticalFlexContainer from '../layout/VerticalFlexContainer';
import LoadingSpinner from '../widgets/LoadingSpinner';
import globalMessages from '../../i18n/global-messages';
import { Box } from '@mui/material';

const messages = defineMessages({
  dialogTitle: {
    id: 'buy.dialog.title',
    defaultMessage: '!!!Buy ADA',
  },
  dialogSelectAddress: {
    id: 'buysell.dialog.selectAddress',
    defaultMessage:
      '!!!Please select the receiving address. This will be shared with the third party provider called Changelly for the buy / sell of ADA. ',
  },
  dialogDescription: {
    id: 'buysell.dialog.instructions',
    defaultMessage:
      '!!!Please select your preferences. On the next screen, confirm your selection by pressing the green arrow on the top right',
  },
  dialogManual: {
    id: 'buysell.dialog.manual',
    defaultMessage: '!!!I will add my address manually',
  },
});

export type WalletInfo = {|
  walletName: string,
  currencyName: string,
  anAddressFormatted: string,
|};

type Props = {|
  +onCancel: void => void,
  +genWalletList: () => Promise<Array<WalletInfo>>,
|};

const WIDGET_URL =
  'https://widget.changelly.com?from=*&to=*&amount=200&fromDefault=usd&toDefault=ada&theme=default&merchant_id=g9qheu8vschp16jj&payment_id=&v=3';

type State = {|
  addressSelected: ?string,
  walletList: ?Array<WalletInfo>,
|};

@observer
export default class BuySellDialog extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    addressSelected: null,
    walletList: null,
  };

  async componentDidMount() {
    const { intl } = this.context;

    const resp = await this.props.genWalletList();
    const wallets = [
      ...resp,
      {
        walletName: intl.formatMessage(messages.dialogManual),
        currencyName: '',
        anAddressFormatted: '',
      },
    ];
    this.setState({ walletList: wallets });
  }

  createRows: ($npm$ReactIntl$IntlFormat, Array<WalletInfo>) => Node = (intl, wallets) =>
    wallets.map((wallet, i) => {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className={styles.row}>
          <div className={styles.left}>
            <div className={styles.nameAndCurrency}>
              {wallet.currencyName ? `(${wallet.currencyName}) ` : ''}
              {wallet.walletName}
            </div>
            <div className={styles.address}>{truncateAddress(wallet.anAddressFormatted)}</div>
          </div>
          <div className={styles.right}>
            {/* Verify Address action */}
            <button
              type="button"
              onClick={() => this.setState({ addressSelected: wallet.anAddressFormatted })}
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
      );
    });

  render(): Node {
    const { intl } = this.context;

    if (this.state.walletList == null) {
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
        >
          <VerticalFlexContainer>
            <LoadingSpinner />
          </VerticalFlexContainer>
        </Dialog>
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
        >
          <div className={styles.content}>
            <Box mb="24px">{intl.formatMessage(messages.dialogSelectAddress)}</Box>
            {addressNodes}
          </div>
        </Dialog>
      );
    }

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        closeButton={<DialogCloseButton />}
      >
        <div className={styles.component}>
          <div className={styles.description}>{intl.formatMessage(messages.dialogDescription)}</div>
          <ChangellyFetcher widgetURL={WIDGET_URL} address={this.state.addressSelected} />
        </div>
      </Dialog>
    );
  }
}
