// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { computed, action, observable } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';

import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../../components/widgets/Dialog';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import ExportPublicKeyDialog from '../../../components/wallet/settings/ExportPublicKeyDialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

export type GeneratedData = typeof ExportWalletDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  publicDeriver: void | PublicDeriver<>,
|};

@observer
export default class ExportWalletDialogContainer extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <ExportPublicKeyDialog
        onClose={this.generated.actions.dialogs.closeActiveDialog.trigger}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |}
      |},
    |},
    stores: {|
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ExportWalletDialogContainer)} no way to generated props`);
    }
    const { actions, stores } = this.props;
    return Object.freeze({
      stores: Object.freeze({
      }),
      actions: {
        dialogs: {
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
    });
  }
}
