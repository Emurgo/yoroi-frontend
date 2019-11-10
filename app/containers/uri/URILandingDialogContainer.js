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
  onConfirm: void => void,
  uriParams: ?UriParams,
|};

@observer
export default class URILandingDialogContainer extends Component<Props> {

  @observable showDisclaimer = true;

  @action
  toggleShowDisclaimer = () => {
    this.showDisclaimer = !this.showDisclaimer;
  }

  onSubmit = () => {
    this.toggleShowDisclaimer();
  };

  onVerifiedSubmit = () => {
    this.props.onConfirm();
  };

  onCancel = () => {
    this.props.onClose();
  }

  render() {
    if (!this.props.uriParams) {
      return (
        <URIInvalidDialog
          onClose={this.onCancel}
          onSubmit={this.onCancel}
          classicTheme={this.props.classicTheme}
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
          classicTheme={this.props.classicTheme}
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
