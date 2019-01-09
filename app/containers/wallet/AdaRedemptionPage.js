// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedProps } from '../../types/injectedPropsType';
import AdaRedemptionForm from '../../components/wallet/ada-redemption/AdaRedemptionForm';
import AdaRedemptionNoWallets from '../../components/wallet/ada-redemption/AdaRedemptionNoWallets';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { ADA_REDEMPTION_TYPES } from '../../types/redemptionTypes';
import { ROUTES } from '../../routes-config';

@observer
export default class AdaRedemptionPage extends Component<InjectedProps> {
  static defaultProps = { actions: null, stores: null };

  handleGoToCreateWalletClick = () => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  };

  render() {
    const { ada, adaRedemption } = this.props.stores;
    const { wallets } = ada;
    const {
      redeemAdaRequest, redeemPaperVendedAdaRequest,
      isCertificateEncrypted, redemptionType
    } = adaRedemption;
    const { chooseRedemptionType } = this.props.actions.ada.adaRedemption;

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
          wallets={selectableWallets}
          redemptionType={redemptionType}
          redemptionCode={adaRedemption.redemptionCode}
          getSelectedWallet={walletId => wallets.getWalletById(walletId)}
          onChooseRedemptionType={(choice) => {
            chooseRedemptionType.trigger({ redemptionType: choice });
          }}
        />
      </div>
    );
  }
}
