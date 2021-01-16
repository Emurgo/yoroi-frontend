// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import Voting from '../../components/wallet/voting/Voting';
import VotingRegistrationDialogContainer from './dialogs/voting/VotingRegistrationDialogContainer';
import type { GeneratedData as VotingRegistrationDialogContainerData } from './dialogs/voting/VotingRegistrationDialogContainer';
import { handleExternalLinkClick } from '../../utils/routing';

export type GeneratedData = typeof VotingPage.prototype.generated;
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};

@observer
export default class VotingPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  onClose: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  start: void => void = () => {
    this.generated.actions.dialogs.open.trigger({ dialog: VotingRegistrationDialogContainer });
  };

  render(): Node {
    const { uiDialogs } = this.generated.stores;
    let activeDialog = null;
    if (uiDialogs.isOpen(VotingRegistrationDialogContainer)) {
      activeDialog = (
        <VotingRegistrationDialogContainer
          {...this.generated.VotingRegistrationDialogProps}
          onClose={this.onClose}
        />
      );
    }
    return (
      <div>
        {activeDialog}
        <Voting start={this.start} onExternalLinkClick={handleExternalLinkClick} />
      </div>
    );
  }

  @computed get generated(): {|
    VotingRegistrationDialogProps: InjectedOrGenerated<VotingRegistrationDialogContainerData>,
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(VotingPage)} no way to generated props`);
    }

    const { stores, actions } = this.props;
    return Object.freeze({
      actions: {
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
      },
      stores: {
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
      },
      VotingRegistrationDialogProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<VotingRegistrationDialogContainerData>),
    });
  }
}
