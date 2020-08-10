// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ItnOptionDialog from '../../../components/transfer/cards/ItnOptionDialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { RestoreModeType } from '../../../actions/common/wallet-restore-actions';
import config from '../../../config';
import { ApiMethodNotYetImplementedError } from '../../../stores/lib/Request';
import ErrorPage from '../../../components/transfer/ErrorPage';
import { intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';

export type GeneratedData = typeof ItnEraOptionDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onCancel: void => void,
|};

@observer
export default class ItnEraOptionDialogContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  startTransferIcarusFunds: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'cip1852',
        extra: undefined,
        length: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT,
      },
    });
  }

  startTransferYoroiPaperFunds: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'cip1852',
        extra: 'paper',
        length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
      },
    });
  }

  render(): Node {
    const { intl } = this.context;
    return (
      <ErrorPage
        error={new ApiMethodNotYetImplementedError()}
        onCancel={this.props.onCancel}
        title=""
        classicTheme={false}
        backButtonLabel={intl.formatMessage(globalMessages.cancel)}
      />
    );
    // return (
    //   <ItnOptionDialog
    //     onRegular={this.startTransferIcarusFunds}
    //     onPaper={this.startTransferYoroiPaperFunds}
    //     onCancel={this.props.onCancel}
    //   />
    // );
  }

  @computed get generated(): {|
    stores: {||},
    actions: {|
      yoroiTransfer: {|
        startTransferFunds: {|
          trigger: (params: {|
            source: RestoreModeType
          |}) => void
        |},
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ItnEraOptionDialogContainer)} no way to generated props`);
    }
    const { actions, } = this.props;
    const { yoroiTransfer } = actions;
    return Object.freeze({
      stores: Object.freeze({}),
      actions: {
        yoroiTransfer: {
          startTransferFunds: { trigger: yoroiTransfer.startTransferFunds.trigger },
        },
      },
    });
  }
}
