// @flow
import React, { Component } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import type { InjectedDialogContainerProps } from '../../types/injectedPropsType';

import URILandingDialog from '../../components/uri/URILandingDialog';
import URIVerifyDialog from '../../components/uri/URIVerifyDialog';
import URIInvalidDialog from '../../components/uri/URIInvalidDialog';

import type { UriParams } from '../../utils/URIHandling';

type Props = {|
  ...InjectedDialogContainerProps,
  +onConfirm: void => void,
  +uriParams: ?UriParams,
|};

@observer
export default class URILandingDialogContainer extends Component<Props> {

  @observable showDisclaimer = true;

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
    if (!this.props.uriParams) {
      return (
        <URIInvalidDialog
          onClose={this.onCancel}
          onSubmit={this.onCancel}
        />
      );
    }
    // assert not null
    const uriParams = this.props.uriParams;

    if (!this.showDisclaimer) {
      return (
        <URIVerifyDialog
          onSubmit={this.onVerifiedSubmit}
          onBack={() => this.toggleShowDisclaimer()}
          onCancel={this.onCancel}
          uriParams={uriParams}
          selectedExplorer={this.props.stores.profile.selectedExplorer}
        />
      );
    }

    return (
      <URILandingDialog
        onSubmit={() => this.toggleShowDisclaimer()}
        onClose={this.onCancel}
        classicTheme={this.props.classicTheme}
      />
    );


  }

}
