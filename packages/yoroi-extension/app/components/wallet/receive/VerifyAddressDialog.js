// @flow

/* eslint react/jsx-one-expression-per-line: 0 */ // the &nbsp; in the html breaks this

import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Notification } from '../../../types/notification.types';
import type { StandardAddress } from '../../../types/AddressFilterTypes';
import type { Addressing } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import type { InjectedLayoutProps } from '../../../styles/context/layout';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { toDerivationPathString } from '../../../api/ada/lib/cardanoCrypto/keys/path';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { truncateAddress } from '../../../utils/formatters';
import { CoreAddressTypes } from '../../../api/ada/lib/storage/database/primitives/enums';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  isCardanoHaskellAddress,
  getCardanoSpendingKeyHash,
  normalizeToAddress,
} from '../../../api/ada/lib/storage/bridge/utils';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import { withLayout } from '../../../styles/context/layout';
import classnames from 'classnames';
import QrCodeWrapper from '../../widgets/QrCodeWrapper';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import RawHash from '../../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import LocalizableError from '../../../i18n/LocalizableError';
import globalMessages from '../../../i18n/global-messages';
import styles from './VerifyAddressDialog.scss';
import CopyableAddress from '../../widgets/CopyableAddress';
import { Typography } from '@mui/material';

const messages = defineMessages({
  addressDetailsTitleLabel: {
    id: 'wallet.receive.confirmationDialog.addressDetailsTitleLabel',
    defaultMessage: '!!!Verify address',
  },
  verifyAddressButtonLabel: {
    id: 'wallet.receive.confirmationDialog.verifyAddressButtonLabel',
    defaultMessage: '!!!Verify on hardware wallet',
  },
});

type Props = {|
  +isActionProcessing: boolean,
  +error: ?LocalizableError,
  +verify: void => PossiblyAsync<void>,
  +cancel: void => void,
  +selectedExplorer: SelectedExplorer,
  +notification: ?Notification,
  +onCopyAddressTooltip: string => void,
  +isHardware: boolean,
  +addressInfo: $ReadOnly<StandardAddress>,
  +classicTheme: boolean,
  +complexityLevel: ?ComplexityLevelType,
|};

@observer
class VerifyAddressDialog extends Component<Props & InjectedLayoutProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  getLabelStyle: void => string = () => {
    return this.props.classicTheme ? 'SimpleFormField_label FormFieldOverridesClassic_label' : styles.label;
  };

  render(): Node {
    const { intl } = this.context;

    const dialogActions = !this.props.isHardware
      ? []
      : [
          {
            label: intl.formatMessage(messages.verifyAddressButtonLabel),
            primary: true,
            isSubmitting: this.props.isActionProcessing,
            onClick: this.props.verify,
          },
        ];

    return (
      <Dialog
        className={classnames([styles.component, 'VerifyAddressDialog'])}
        title={intl.formatMessage(messages.addressDetailsTitleLabel)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={this.props.cancel}
        id="verifyAddressDialog"
      >
        {this.renderQrCode()}
        {this.renderAddressBlock()}
        {this.renderPath(this.props.addressInfo.addressing)}
        {this.renderStakingKey()}
        {this.renderSpendingKey()}
        {this.renderPointer()}
        {this.props.error ? <ErrorBlock error={this.props.error} /> : null}
      </Dialog>
    );
  }

  renderAddressBlock: void => Node = () => {
    const { intl } = this.context;
    const notificationId = 'verify-address-notification';
    return (
      <>
        <Typography variant="body1" color="ds.text_gray_medium" className={this.getLabelStyle()}>
          {intl.formatMessage(globalMessages.addressLabel)}
        </Typography>
        <div className="verificationAddress">
          <CopyableAddress
            id="verifyAddressDialog"
            hash={this.props.addressInfo.address}
            elementId={notificationId}
            onCopyAddress={() => this.props.onCopyAddressTooltip(notificationId)}
            notification={this.props.notification}
            placementTooltip="bottom-start"
          >
            <ExplorableHashContainer
              light={false}
              selectedExplorer={this.props.selectedExplorer}
              hash={this.props.addressInfo.address}
              linkType={this.props.addressInfo.type === CoreAddressTypes.CARDANO_REWARD ? 'stakeAddress' : 'address'}
            >
              <RawHash light={false} className={styles.hash}>
                {truncateAddress(this.props.addressInfo.address)}
              </RawHash>
            </ExplorableHashContainer>
          </CopyableAddress>
        </div>
        <br />
      </>
    );
  };

  renderQrCode: void => Node = () => {
    return (
      <>
        <div align="center">
          <QrCodeWrapper fgColor="black" value={this.props.addressInfo.address} size={152} />
        </div>
        <br />
        <br />
      </>
    );
  };

  /** we always show the staking key
   *  because hardware wallets will display the staking key on the device
   */
  renderStakingKey: void => Node = () => {
    const { intl } = this.context;
    const { type: addrType, address } = this.props.addressInfo;

    const getStakingKey = (WasmScope: typeof RustModule) => {
      if (addrType === CoreAddressTypes.CARDANO_BASE) {
        const wasmAddr = WasmScope.WalletV4.BaseAddress.from_address(
          WasmScope.WalletV4.Address.from_bech32(address)
        )?.stake_cred();
        return (wasmAddr?.to_keyhash() ?? wasmAddr?.to_scripthash())?.to_hex();
      }
    };

    const stakingKey = RustModule.WasmScope(getStakingKey);
    if (stakingKey == null) return null;
    return (
      <>
        <Typography variant="body1" color="ds.text_gray_medium" className={this.getLabelStyle()}>
          {intl.formatMessage(globalMessages.stakingKeyHashLabel)}
        </Typography>
        <div className="stakingKey" id="verifyAddressDialog-stakingKeyHash-text">
          <RawHash light={false} className={styles.hash}>
            {stakingKey}
          </RawHash>
        </div>
        <br />
      </>
    );
  };

  renderSpendingKey: void => Node = () => {
    const { intl } = this.context;

    // this is useful for querying servers & debugging. Not so useful for the average user.
    if (this.props.complexityLevel !== ComplexityLevels.Advanced) {
      return null;
    }

    const getSpendingKey = () => {
      if (isCardanoHaskellAddress(this.props.addressInfo.type)) {
        const wasmAddr = normalizeToAddress(this.props.addressInfo.address);
        if (wasmAddr == null) throw new Error('Should never happen');
        const spendingKey = getCardanoSpendingKeyHash(wasmAddr);
        if (spendingKey === null) return null; // legacy address ignored
        if (spendingKey === undefined) return null; // TODO: handle script outputs
        return spendingKey.to_hex();
      }
    };

    const spendingKey = getSpendingKey();
    if (spendingKey == null) return null;
    return (
      <>
        <Typography variant="body1" color="ds.text_gray_medium" className={this.getLabelStyle()}>
          {intl.formatMessage(globalMessages.spendingKeyHashLabel)}
        </Typography>
        <div className="spendingKey">
          <RawHash light={false} className={styles.hash}>
            {spendingKey}
          </RawHash>
        </div>
        <br />
      </>
    );
  };

  /** hardware wallets display the pointer information on the device */
  renderPointer: void => Node = () => {
    const { intl } = this.context;

    if (this.props.addressInfo.type !== CoreAddressTypes.CARDANO_PTR) {
      return null;
    }

    const addrInfo = RustModule.WasmScope(Scope => {
      const wasmAddr = Scope.WalletV4.PointerAddress.from_address(
        RustModule.WalletV4.Address.from_bech32(this.props.addressInfo.address)
      )?.stake_pointer();
      if (wasmAddr == null) return null; // should never happen

      return [wasmAddr.slot(), wasmAddr.tx_index(), wasmAddr.cert_index()];
    });

    if (addrInfo == null) return null; // should never happen

    const [slot, txIdx, certIdx] = addrInfo;

    return (
      <>
        <Typography className={this.getLabelStyle()} variant="body1" color="ds.text_gray_medium">
          {intl.formatMessage(globalMessages.keyRegistrationPointer)}sdsds
        </Typography>
        <Typography className="keyPointer" variant="body1" color="ds.text_gray_low">
          <RawHash light={false} className={styles.hash}>
            ({slot}, {txIdx}, {certIdx})
          </RawHash>
        </Typography>
        <br />
      </>
    );
  };

  renderPath: (void | $PropertyType<Addressing, 'addressing'>) => Node = addressing => {
    if (addressing == null) return null;
    const { intl } = this.context;
    const derivationClasses = classnames([styles.derivation]);
    return (
      <>
        <Typography className={this.getLabelStyle()} variant="body1" color="ds.text_gray_medium">
          {intl.formatMessage(globalMessages.derivationPathLabel)}
        </Typography>
        <div className={derivationClasses}>
          <Typography
            className={styles.hash}
            id="verifyAddressDialog-derivationPath-text"
            variant="body1"
            color="ds.text_gray_low"
          >
            {toDerivationPathString(addressing.path)}
          </Typography>
        </div>
        <br />
      </>
    );
  };
}

export default (withLayout(VerifyAddressDialog): ComponentType<Props>);
