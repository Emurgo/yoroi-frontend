// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

import DangerousActionDialog from '../../../components/widgets/DangerousActionDialog';

export type GeneratedData = typeof IncludePublicKeyDialog.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +downloadIncludingKey: void => void,
  +downloadExcludingKey: void => void,
|};

const dialogMessages = defineMessages({
  includeKeyExplanationLine1: {
    id: 'wallet.includeKey.explanationLine1',
    defaultMessage: `!!!Do you want to include your wallet's <strong>public</strong> key in the error logs?`,
  },
  withKey: {
    id: 'wallet.includeKey.withKeyLabel',
    defaultMessage: '!!!With key',
  },
  withoutKey: {
    id: 'wallet.includeKey.withoutKeyLabel',
    defaultMessage: '!!!Without key',
  },
});

@observer
export default class IncludePublicKeyDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  @observable isChecked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    this.isChecked = !this.isChecked;
  }

  render(): Node {
    const { intl } = this.context;

    return (
      <DangerousActionDialog
        title={intl.formatMessage(globalMessages.downloadLogsButtonLabel)}
        checkboxAcknowledge={intl.formatMessage(globalMessages.uriLandingDialogConfirmLabel)}
        isChecked={this.isChecked}
        toggleCheck={this.toggleCheck}
        isSubmitting={false}
        error={undefined}
        onCancel={this.generated.actions.dialogs.closeActiveDialog.trigger}
        primaryButton={{
          label: intl.formatMessage(dialogMessages.withKey),
          onClick: () => {
            this.props.downloadIncludingKey();
            this.generated.actions.dialogs.closeActiveDialog.trigger();
          }
        }}
        secondaryButton={{
          label: intl.formatMessage(dialogMessages.withoutKey),
          onClick: () => {
            this.props.downloadExcludingKey();
            this.generated.actions.dialogs.closeActiveDialog.trigger();
          }
        }}
      >
        <p><FormattedHTMLMessage {...dialogMessages.includeKeyExplanationLine1} /></p>
        <p><FormattedHTMLMessage {...globalMessages.publicKeyExplanation} /></p>
      </DangerousActionDialog>
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
      throw new Error(`${nameof(IncludePublicKeyDialog)} no way to generated props`);
    }
    const { actions, } = this.props;
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
