// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import { toDerivationPathString } from '../../../api/common/lib/crypto/keys/path';

import QrCodeWrapper from '../../widgets/QrCodeWrapper';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import RawHash from '../../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';

import LocalizableError from '../../../i18n/LocalizableError';
import globalMessages from '../../../i18n/global-messages';
import styles from './VerifyAddressDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { truncateAddress } from '../../../utils/formatters';
import CopyableAddress from '../../widgets/CopyableAddress';
import type { Notification } from '../../../types/notificationType';
import type { StandardAddress, } from '../../../types/AddressFilterTypes';
import type { Addressing } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { CoreAddressTypes } from '../../../api/ada/lib/storage/database/primitives/enums';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  isJormungandrAddress,
  isCardanoHaskellAddress,
  getCardanoSpendingKeyHash,
  getJormungandrSpendingKey,
  normalizeToAddress,
} from '../../../api/ada/lib/storage/bridge/utils';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import { ComplexityLevels } from '../../../types/complexityLevelType';

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
export default class VerifyAddressDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  getLabelStyle: void => string = () => {
    return this.props.classicTheme ?
      'SimpleFormField_label FormFieldOverridesClassic_label' :
      styles.label;
  }

  render(): Node {
    const { intl } = this.context;

    const dialogActions = !this.props.isHardware
      ? []
      : [{
        label: intl.formatMessage(messages.verifyAddressButtonLabel),
        primary: true,
        isSubmitting: this.props.isActionProcessing,
        onClick: this.props.verify,
      }];

    return (
      <Dialog
        className={classnames([styles.component, 'VerifyAddressDialog'])}
        title={intl.formatMessage(messages.addressDetailsTitleLabel)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={this.props.cancel}
      >
        {this.renderQrCode()}
        {this.renderAddressBlock()}
        {this.renderPath(this.props.addressInfo.addressing)}
        {this.renderStakingKey()}
        {this.renderSpendingKey()}
        {this.renderPointer()}
        { this.props.error ? (<ErrorBlock error={this.props.error} />) : null }
      </Dialog>);
  }

  renderAddressBlock: void => Node = () => {
    const { intl } = this.context;
    const notificationId = 'verify-address-notification';
    return (
      <>
        <span className={this.getLabelStyle()}>
          {intl.formatMessage(globalMessages.addressLabel)}
        </span>
        <div className="verificationAddress">
          <CopyableAddress
            hash={this.props.addressInfo.address}
            elementId={notificationId}
            onCopyAddress={
              () => this.props.onCopyAddressTooltip(notificationId)
            }
            notification={this.props.notification}
          >
            <ExplorableHashContainer
              light={false}
              selectedExplorer={this.props.selectedExplorer}
              hash={this.props.addressInfo.address}
              linkType="address"
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
  }

  renderQrCode: void => Node = () => {
    return (
      <>
        <div align="center">
          <QrCodeWrapper
            value={this.props.addressInfo.address}
            size={152}
          />
        </div>
        <br />
        <br />
      </>
    );
  }

  /** we always show the staking key
   *  because hardware wallets will display the staking key on the device
   */
  renderStakingKey: (void) => Node = () => {
    const { intl } = this.context;

    const getStakingKey = () => {
      if (this.props.addressInfo.type === CoreAddressTypes.JORMUNGANDR_GROUP) {
        const wasmAddr = RustModule.WalletV3.Address.from_string(
          this.props.addressInfo.address
        ).to_group_address();
        if (wasmAddr == null) return null; // should never happen
        return Buffer.from(wasmAddr.get_account_key().as_bytes()).toString('hex');
      }
      if (this.props.addressInfo.type === CoreAddressTypes.CARDANO_BASE) {
        const wasmAddr = RustModule.WalletV4.BaseAddress.from_address(
          RustModule.WalletV4.Address.from_bech32(this.props.addressInfo.address)
        )?.stake_cred();
        if (wasmAddr == null) return null; // should never happen
        const hash = wasmAddr.to_keyhash() ?? wasmAddr.to_scripthash();
        if (hash == null) return null; // should never happen
        return Buffer.from(hash.to_bytes()).toString('hex');
      }
    };

    const stakingKey = getStakingKey();
    if (stakingKey == null) return null;
    return (
      <>
        <span className={this.getLabelStyle()}>
          {intl.formatMessage(
            isJormungandrAddress(this.props.addressInfo.type)
              ? globalMessages.stakingKeyLabel
              : globalMessages.stakingKeyHashLabel
          )}
        </span>
        <div className="stakingKey">
          <RawHash light={false} className={styles.hash}>
            {stakingKey}
          </RawHash>
        </div>
        <br />
      </>
    );
  }

  renderSpendingKey: (void) => Node = () => {
    const { intl } = this.context;

    // this is useful for querying servers & debugging. Not so useful for the average user.
    if (this.props.complexityLevel !== ComplexityLevels.Advanced) {
      return null;
    }
    const getSpendingKey = () => {
      if (isJormungandrAddress(this.props.addressInfo.type)) {
        const wasmAddr = RustModule.WalletV3.Address.from_string(
          this.props.addressInfo.address
        );
        const spendingKey = getJormungandrSpendingKey(wasmAddr);
        if (spendingKey == null) return null; // should never happen
        return Buffer.from(spendingKey.as_bytes()).toString('hex');
      }
      if (isCardanoHaskellAddress(this.props.addressInfo.type)) {
        const wasmAddr = normalizeToAddress(this.props.addressInfo.address);
        if (wasmAddr == null) throw new Error('Should never happen');
        const spendingKey = getCardanoSpendingKeyHash(wasmAddr);
        if (spendingKey === null) return null; // legacy address ignored
        if (spendingKey === undefined) return null; // TODO: handle script outputs
        return Buffer.from(spendingKey.to_bytes()).toString('hex');
      }
    };

    const spendingKey = getSpendingKey();
    if (spendingKey == null) return null;
    return (
      <>
        <span className={this.getLabelStyle()}>
          {intl.formatMessage(
            isJormungandrAddress(this.props.addressInfo.type)
              ? globalMessages.spendingKeyLabel
              : globalMessages.spendingKeyHashLabel
          )}
        </span>
        <div className="spendingKey">
          <RawHash light={false} className={styles.hash}>
            {spendingKey}
          </RawHash>
        </div>
        <br />
      </>
    );
  }

  /** hardware wallets display the pointer information on the device */
  renderPointer: (void) => Node = () => {
    const { intl } = this.context;

    if (this.props.addressInfo.type !== CoreAddressTypes.CARDANO_PTR) {
      return null;
    }
    const wasmAddr = RustModule.WalletV4.PointerAddress.from_address(
      RustModule.WalletV4.Address.from_bech32(this.props.addressInfo.address)
    )?.stake_pointer();
    if (wasmAddr == null) return null; // should never happen

    return (
      <>
        <span className={this.getLabelStyle()}>
          {intl.formatMessage(globalMessages.keyRegistrationPointer)}
        </span>
        <div className="keyPointer">
          <RawHash light={false} className={styles.hash}>
            ({wasmAddr.slot()}, {wasmAddr.tx_index()}, {wasmAddr.cert_index()})
          </RawHash>
        </div>
        <br />
      </>
    );
  }

  renderPath: (void | $PropertyType<Addressing, 'addressing'>) => Node = (addressing) => {
    if (addressing == null) return null;
    const { intl } = this.context;
    const derivationClasses = classnames([styles.derivation]);
    return (
      <>
        <span className={this.getLabelStyle()}>
          {intl.formatMessage(globalMessages.derivationPathLabel)}
        </span>
        <div className={derivationClasses}>
          <div className={styles.hash}>
            {toDerivationPathString(addressing.path)}
          </div>
        </div>
        <br />
      </>
    );
  }
}
