// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';
import { LoadingButton } from '@mui/lab';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './StandardHeader.scss';
import CopyableAddress from '../../widgets/CopyableAddress';
import QrCodeWrapper from '../../widgets/QrCodeWrapper';
import RawHash from '../../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { Notification } from '../../../types/notification.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { truncateAddress } from '../../../utils/formatters';

const messages = defineMessages({
  walletAddressLabel: {
    id: 'wallet.receive.page.walletAddressLabel',
    defaultMessage: '!!!Your wallet address',
  },
  walletReceiveInstructions: {
    id: 'wallet.receive.page.walletReceiveInstructions',
    defaultMessage:
      '!!!Share this wallet address to receive payments. To protect your privacy, new addresses are generated automatically once you use them.',
  },
  generateNewAddressButtonLabel: {
    id: 'wallet.receive.page.generateNewAddressButtonLabel',
    defaultMessage: '!!!Generate new address',
  },
});

type Props = {|
  +walletAddress: string,
  +selectedExplorer: SelectedExplorer,
  +isWalletAddressUsed: boolean,
  +onGenerateAddress: void => Promise<void>,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
  +isFilterActive: boolean,
|};

@observer
export default class StandardHeader extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  submit: void => Promise<void> = async () => {
    await this.props.onGenerateAddress();
  };

  render(): Node {
    const {
      walletAddress,
      isSubmitting,
      error,
      isWalletAddressUsed,
      onCopyAddressTooltip,
      notification,
    } = this.props;
    const { intl } = this.context;
    const mainAddressNotificationId = 'mainAddress-copyNotification';

    const generateAddressForm = (
      <LoadingButton
        variant="primary"
        loading={isSubmitting}
        className="generateAddressButton"
        onClick={this.submit}
        disabled={this.props.isFilterActive}
      >
        {intl.formatMessage(messages.generateNewAddressButtonLabel)}
      </LoadingButton>
    );

    const copyableHashClass = classnames([styles.copyableHash]);

    const walletHeader = (
      <div className={styles.qrCodeAndInstructions}>
        <div className={styles.instructions}>
          <div className={styles.hashLabel}>{intl.formatMessage(messages.walletAddressLabel)}</div>
          <CopyableAddress
            id='standartHeader'
            darkVariant
            hash={walletAddress}
            elementId={mainAddressNotificationId}
            onCopyAddress={() => onCopyAddressTooltip(walletAddress, mainAddressNotificationId)}
            notification={notification}
            placementTooltip="bottom-start"
          >
            <ExplorableHashContainer
              selectedExplorer={this.props.selectedExplorer}
              hash={walletAddress}
              light={isWalletAddressUsed}
              linkType="address"
            >
              <RawHash light={isWalletAddressUsed}>
                <span className={copyableHashClass}>{truncateAddress(walletAddress)}</span>
              </RawHash>
            </ExplorableHashContainer>
          </CopyableAddress>
          <div className={styles.postCopyMargin} />
          <div className={styles.instructionsText}>
            <FormattedHTMLMessage {...messages.walletReceiveInstructions} />
          </div>
          {generateAddressForm}
          {error ? (
            <div className={styles.error}>{intl.formatMessage(error)}</div>
          ) : (
            <div className={styles.error}>&nbsp;</div>
          )}
        </div>
        <div className={styles.qrCode}>
          <QrCodeWrapper value={walletAddress} size={152} />
        </div>
      </div>
    );

    return walletHeader;
  }
}
