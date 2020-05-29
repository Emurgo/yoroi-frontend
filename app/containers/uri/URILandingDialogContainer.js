// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';

import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import URILandingDialog from '../../components/uri/URILandingDialog';
import URIVerifyDialog from '../../components/uri/URIVerifyDialog';
import URIInvalidDialog from '../../components/uri/URIInvalidDialog';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import type { ExplorerType } from '../../domain/Explorer';
import type { UriParams } from '../../utils/URIHandling';
import { getApiMeta, ApiOptions, } from '../../api/common/utils';

export type GeneratedData = typeof URILandingDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
  +onConfirm: void => void,
|};

@observer
export default class URILandingDialogContainer extends Component<Props> {

  @observable showDisclaimer: boolean = true;

  @action
  toggleShowDisclaimer: void => void = () => {
    this.showDisclaimer = !this.showDisclaimer;
  }

  onSubmit: void => void = () => {
    this.toggleShowDisclaimer();
  };

  onVerifiedSubmit: void => void = () => {
    this.props.onConfirm();
  };

  onCancel: void => void = () => {
    this.props.onClose();
  }

  render(): Node {
    if (!this.generated.stores.loading.uriParams) {
      return (
        <URIInvalidDialog
          onClose={this.onCancel}
          onSubmit={this.onCancel}
        />
      );
    }
    // assert not null
    const uriParams = this.generated.stores.loading.uriParams;

    const apiMeta = getApiMeta(ApiOptions.ada);
    if (apiMeta == null) throw new Error(`${nameof(URILandingDialogContainer)} no API found`);

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore.getCurrentPrice(
          apiMeta.meta.primaryTicker,
          this.generated.stores.profile.unitOfAccount.currency
        )
      )
      : null;

    if (!this.showDisclaimer) {
      return (
        <URIVerifyDialog
          meta={{
            primaryTicker: apiMeta.meta.primaryTicker,
            decimalPlaces: apiMeta.meta.decimalPlaces.toNumber(),
          }}
          onSubmit={this.onVerifiedSubmit}
          onBack={this.toggleShowDisclaimer}
          onCancel={this.onCancel}
          uriParams={uriParams}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          coinPrice={coinPrice}
        />
      );
    }

    return (
      <URILandingDialog
        onSubmit={this.toggleShowDisclaimer}
        onClose={this.onCancel}
        classicTheme={this.generated.stores.profile.isClassicTheme}
      />
    );
  }

  @computed get generated(): {|
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?number
      |},
      loading: {| uriParams: ?UriParams |},
      profile: {|
        isClassicTheme: boolean,
        selectedExplorer: ExplorerType,
        unitOfAccount: UnitOfAccountSettingType
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(URILandingDialogContainer)} no way to generated props`);
    }
    const { stores, } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          selectedExplorer: stores.profile.selectedExplorer,
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        loading: {
          uriParams: stores.loading.uriParams,
        },
      },
    });
  }
}
