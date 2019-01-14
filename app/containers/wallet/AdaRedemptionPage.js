// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedProps } from '../../types/injectedPropsType';
import AdaRedemptionForm from '../../components/wallet/ada-redemption/AdaRedemptionForm';
import AdaRedemptionNoWallets from '../../components/wallet/ada-redemption/AdaRedemptionNoWallets';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { ADA_REDEMPTION_TYPES } from '../../types/redemptionTypes';
import { AdaRedemptionCertificateParseError } from '../../i18n/errors';
import validWords from '../../api/ada/lib/valid-words.en';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';

@observer
export default class AdaRedemptionPage extends Component<InjectedProps> {
  static defaultProps = { actions: null, stores: null };

  handleGoToCreateWalletClick = () => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  };

  render() {
    const { substores } = this.props.stores;
    const { ada } = substores;
    const { wallets, adaRedemption } = ada;
    const isMainnet = environment.isMainnet();
    const {
      redeemAdaRequest, redeemPaperVendedAdaRequest,
      isCertificateEncrypted, redemptionType, error,
      isRedemptionDisclaimerAccepted
    } = adaRedemption;
    const {
      chooseRedemptionType, setRedemptionCode, setCertificate
    } = this.props.actions.ada.adaRedemption;

    const selectableWallets = wallets.all.map((w) => ({
      value: w.id, label: w.name
    }));

    if (!wallets.all.length) {
      return (
        <div>
          <AdaRedemptionNoWallets
            onGoToCreateWalletClick={this.handleGoToCreateWalletClick}
          />
        </div>
      );
    }

    if (selectableWallets.length === 0) return <div><LoadingSpinner /></div>;

    const request = (redemptionType === ADA_REDEMPTION_TYPES.PAPER_VENDED ?
      redeemPaperVendedAdaRequest : redeemAdaRequest
    );
    const isCertificateSelected = adaRedemption.certificate !== null;

    const showInputsForDecryptingForceVendedCertificate = (
      isCertificateSelected && isCertificateEncrypted &&
      redemptionType === ADA_REDEMPTION_TYPES.FORCE_VENDED
    );
    const showInputForDecryptionKey = (
      isCertificateSelected && isCertificateEncrypted &&
      redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_FORCE_VENDED
    );
    const showPassPhraseWidget = redemptionType === ADA_REDEMPTION_TYPES.PAPER_VENDED || (
      isCertificateSelected && isCertificateEncrypted && (
        redemptionType === ADA_REDEMPTION_TYPES.REGULAR ||
        redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_REGULAR
      )
    );

    return (
      <div>
        <AdaRedemptionForm
          redemptionCodeValidator={() => {}} // TODO: for now this is a mock just to test the UI
          postVendRedemptionCodeValidator={() => {}} // TODO: for now this is a mock just to test the UI
          onSubmit={() => {}} // TODO: for now this is a mock just to test the UI
          onPassPhraseChanged={() => {}} // TODO: for now this is a mock just to test the UI
          onEmailChanged={() => {}} // TODO: for now this is a mock just to test the UI
          onDecryptionKeyChanged={() => {}} // TODO: for now this is a mock just to test the UI
          onAdaPasscodeChanged={() => {}} // TODO: for now this is a mock just to test the UI
          onAdaAmountChanged={() => {}} // TODO: for now this is a mock just to test the UI
          onCertificateSelected={(certificate) => {}} // TODO: for now this is a mock just to test the UI
          mnemonicValidator={() => { return false; }} // TODO: for now this is a mock just to test the UI
          wallets={selectableWallets}
          isCertificateSelected={isCertificateSelected}
          isCertificateEncrypted={isCertificateEncrypted}
          showPassPhraseWidget={showPassPhraseWidget}
          showInputForDecryptionKey={showInputForDecryptionKey}
          showInputsForDecryptingForceVendedCertificate={
            showInputsForDecryptingForceVendedCertificate
          }
          suggestedMnemonics={validWords}
          isCertificateInvalid={error instanceof AdaRedemptionCertificateParseError}
          onRemoveCertificate={() => {}} // TODO: for now this is a mock just to test the UI
          redemptionType={redemptionType}
          redemptionCode={adaRedemption.redemptionCode}
          getSelectedWallet={walletId => wallets.getWalletById(walletId)}
          onChooseRedemptionType={(choice) => {
            chooseRedemptionType.trigger({ redemptionType: choice });
          }}
          onRedemptionCodeChanged={(redemptionCode) => {
            setRedemptionCode.trigger({ redemptionCode });
          }}
          error={adaRedemption.error}
          isSubmitting={false} // TODO: for now this is a mock just to test the UI
          isRedemptionDisclaimerAccepted={isMainnet || isRedemptionDisclaimerAccepted}
          onAcceptRedemptionDisclaimer={() => {}} // TODO: for now this is a mock just to test the UI
        />
      </div>
    );
  }
}
