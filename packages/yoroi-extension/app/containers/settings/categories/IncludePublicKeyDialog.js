// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import DangerousActionDialog from '../../../components/widgets/DangerousActionDialog';
import type { StoresProps } from '../../../stores';

type Props = {|
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
export default class IncludePublicKeyDialog extends Component<{| ...Props, ...StoresProps |}> {
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
        onCancel={this.props.stores.uiDialogs.closeActiveDialog}
        primaryButton={{
          label: intl.formatMessage(dialogMessages.withKey),
          onClick: () => {
            this.props.downloadIncludingKey();
            this.props.stores.uiDialogs.closeActiveDialog();
          }
        }}
        secondaryButton={{
          label: intl.formatMessage(dialogMessages.withoutKey),
          onClick: () => {
            this.props.downloadExcludingKey();
            this.props.stores.uiDialogs.closeActiveDialog();
          }
        }}
        id="includePublicKeyDialog"
      >
        <div><FormattedHTMLMessage {...dialogMessages.includeKeyExplanationLine1} /></div>
        <div><FormattedHTMLMessage {...globalMessages.publicKeyExplanation} /></div>
      </DangerousActionDialog>
    );
  }
}
