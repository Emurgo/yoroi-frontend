// @flow
import React, { Component } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';

import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import URILandingDialog from '../../components/uri/URILandingDialog';
import URIVerifyDialog from '../../components/uri/URIVerifyDialog';
import URIInvalidDialog from '../../components/uri/URIInvalidDialog';

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

  render() {
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

    if (!this.showDisclaimer) {
      return (
        <URIVerifyDialog
          onSubmit={this.onVerifiedSubmit}
          onBack={this.toggleShowDisclaimer}
          onCancel={this.onCancel}
          uriParams={uriParams}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
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

  @computed get generated() {
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
        },
        loading: {
          uriParams: stores.loading.uriParams,
        },
      },
    });
  }
}
