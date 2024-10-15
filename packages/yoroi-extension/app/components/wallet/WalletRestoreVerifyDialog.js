// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, FormattedHTMLMessage, intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import styles from './WalletRestoreVerifyDialog.scss';
import DialogBackButton from '../widgets/DialogBackButton';
import CopyableAddress from '../widgets/CopyableAddress';
import RawHash from '../widgets/hashWrappers/RawHash';
import WalletAccountIcon from '../topbar/WalletAccountIcon';
import Dialog from '../widgets/Dialog';
import DialogTextBlock from '../widgets/DialogTextBlock';
import LocalizableError from '../../i18n/LocalizableError';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { Notification } from '../../types/notification.types';
import CenteredLayout from '../layout/CenteredLayout';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { truncateAddress } from '../../utils/formatters';
import type { PlateWithMeta } from '../../stores/toplevel/WalletRestoreStore';

const messages = defineMessages({
  dialogTitleVerifyWalletRestoration: {
    id: 'wallet.restore.dialog.verify.title',
    defaultMessage: '!!!Verify Restored Wallet',
  },
  walletRestoreVerifyIntroLine1: {
    id: 'wallet.restore.dialog.verify.intro.line1',
    defaultMessage: '!!!Be careful about wallet restoration:',
  },
  walletRestoreVerifyIntroLine2: {
    id: 'wallet.restore.dialog.verify.intro.line2',
    defaultMessage: '!!!Make sure account checksum and icon match what you remember.',
  },
  walletRestoreVerifyIntroLine3: {
    id: 'wallet.restore.dialog.verify.intro.line3',
    defaultMessage: '!!!Make sure addresses match what you remember',
  },
  walletRestoreVerifyIntroLine4: {
    id: 'wallet.restore.dialog.verify.intro.line4',
    defaultMessage:
      "!!!If you've entered wrong mnemonics or a wrong paper wallet password -" +
      ' you will just open another empty wallet with wrong account checksum and wrong addresses!',
  },
});

type Props = {|
  +plates: Array<PlateWithMeta>,
  +selectedExplorer: SelectedExplorer,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +onNext: void => PossiblyAsync<void>,
  +onCancel: void => void,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

@observer
export default class WalletRestoreVerifyDialog extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  generatePlate(title: string, plate: WalletChecksum): Node {
    return (
      <div key={title}>
        <h2 className={styles.addressLabel}>{title}</h2>
        <div className={styles.plateRowDiv}>
          <WalletAccountIcon iconSeed={plate.ImagePart} />
          <span className={styles.plateIdSpan}>{plate.TextPart}</span>
        </div>
      </div>
    );
  }

  generateAddresses(
    title: string,
    addresses: Array<string>,
    onCopyAddressTooltip: (string, string) => void,
    notification: ?Notification
  ): Node {
    return (
      <>
        <h2 className={styles.addressLabel}>{title}</h2>
        {addresses.map((address, index) => {
          const notificationElementId = `${address}-${index}`;
          return (
            <CopyableAddress
              id={'walletRestoreVerifyDialog_' + index}
              hash={address}
              elementId={notificationElementId}
              onCopyAddress={() => onCopyAddressTooltip(address, notificationElementId)}
              notification={notification}
              placementTooltip="top-start"
              key={address}
            >
              <ExplorableHashContainer
                selectedExplorer={this.props.selectedExplorer}
                hash={address}
                light
                placementTooltip="top-start"
                linkType="address"
              >
                <RawHash light>{truncateAddress(address)}</RawHash>
              </ExplorableHashContainer>
            </CopyableAddress>
          );
        })}
      </>
    );
  }

  render(): Node {
    const { intl } = this.context;
    const {
      error,
      isSubmitting,
      onCancel,
      onNext,
      onCopyAddressTooltip,
      notification,
    } = this.props;

    const dialogClasses = classnames(['walletRestoreVerifyDialog', styles.dialog]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: onCancel,
        disabled: isSubmitting,
      },
      {
        label: intl.formatMessage(globalMessages.confirm),
        onClick: onNext,
        primary: true,
        className: classnames(['confirmButton']),
        isSubmitting,
      },
    ];

    const introMessage = (
      <div>
        <span>{intl.formatMessage(messages.walletRestoreVerifyIntroLine1)}</span>
        <br />
        <ul>
          <li className={styles.smallTopMargin}>
            <span>
              <FormattedHTMLMessage {...messages.walletRestoreVerifyIntroLine2} />
            </span>
          </li>
          <li className={styles.smallTopMargin}>
            <span>
              <FormattedHTMLMessage {...messages.walletRestoreVerifyIntroLine3} />
            </span>
          </li>
          <li className={styles.smallTopMargin}>
            <span>
              <FormattedHTMLMessage {...messages.walletRestoreVerifyIntroLine4} />
            </span>
          </li>
        </ul>
      </div>
    );

    const plateElems = this.props.plates.map(plate =>
      this.generatePlate(intl.formatMessage(plate.checksumTitle), plate.plate)
    );

    const addressElems = this.props.plates.map(plate =>
      this.generateAddresses(
        intl.formatMessage(plate.addressMessage),
        plate.addresses,
        onCopyAddressTooltip,
        notification
      )
    );

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleVerifyWalletRestoration)}
        dialogActions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        backButton={<DialogBackButton onBack={onCancel} />}
      >
        <DialogTextBlock>{introMessage}</DialogTextBlock>

        <DialogTextBlock>
          <CenteredLayout>{plateElems}</CenteredLayout>
        </DialogTextBlock>

        <DialogTextBlock subclass="component-bottom">
          {addressElems.map((elem, i) => {
            if (i === 0) {
              // eslint-disable-next-line react/no-array-index-key
              return <span key={i}>{elem}</span>;
            }
            // eslint-disable-next-line react/no-array-index-key
            return (
              <span key={i}>
                <br />
                {elem}
              </span>
            );
          })}
        </DialogTextBlock>

        <div className={styles.postCopyMargin} />

        {error && <div className={styles.error}>{intl.formatMessage(error, error.values)}</div>}
      </Dialog>
    );
  }
}
