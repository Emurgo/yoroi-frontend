// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';

import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import TransferTypeSelect from '../../components/transfer/cards/TransferTypeSelect';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import YoroiTransferPage from './YoroiTransferPage';
import type { GeneratedData as YoroiTransferPageData } from './YoroiTransferPage';
import DaedalusTransferPage from './DaedalusTransferPage';
import type { GeneratedData as DaedalusTransferPageData } from './DaedalusTransferPage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ByronEraOptionDialogContainer from './options/ByronEraOptionDialogContainer';
import type { GeneratedData as ByronEraOptionDialogContainerData } from './options/ByronEraOptionDialogContainer';
import type { GeneratedData as ShelleyEraOptionDialogContainerData } from './options/ShelleyEraOptionDialogContainer';
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import { genLookupOrFail, getTokenName, } from '../../stores/stateless/tokenHelpers';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import { truncateToken } from '../../utils/formatters';

export type GeneratedData = typeof WalletTransferPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  publicDeriver: PublicDeriver<>,
|};

@observer
export default class WalletTransferPage extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  getIcarusTransferDialog: InjectedOrGenerated<YoroiTransferPageData> => Node = (props) => {
    return (<YoroiTransferPage {...props} />);
  }

  getDaedalusTransferDialog: InjectedOrGenerated<DaedalusTransferPageData> => Node = (props) => {
    return (<DaedalusTransferPage {...props} />);
  }

  render(): Node {
    const { actions, stores } = this.generated;
    const { uiDialogs } = stores;

    let activeDialog = null;
    if (uiDialogs.isOpen(ByronEraOptionDialogContainer)) {
      activeDialog = (
        <ByronEraOptionDialogContainer
          onCancel={this.onClose}
          {...this.generated.ByronEraOptionDialogContainerProps}
        />
      );
    }

    const icarusTransfer = this.generated.YoroiTransferPageProps != null
      ? this.getIcarusTransferDialog(this.generated.YoroiTransferPageProps)
      : null;

    const daedalusTransfer = this.generated.DaedalusTransferPageProps != null
      ? this.getDaedalusTransferDialog(this.generated.DaedalusTransferPageProps)
      : null;

    const defaultToken = this.props.publicDeriver.getParent().getDefaultToken();
    const defaultTokenInfo = genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)({
      identifier: defaultToken.defaultIdentifier,
      networkId: defaultToken.defaultNetworkId,
    });

    return (
      <>
        <TransferTypeSelect
          onByron={() => actions.dialogs.open.trigger({ dialog: ByronEraOptionDialogContainer })}
          onShelley={null}
          ticker={truncateToken(getTokenName(defaultTokenInfo))}
        />
        {activeDialog}
        {icarusTransfer}
        {daedalusTransfer}
      </>
    );
  }


  @computed get generated(): {|
    ByronEraOptionDialogContainerProps: InjectedOrGenerated<ByronEraOptionDialogContainerData>,
    ShelleyEraOptionDialogContainerProps: InjectedOrGenerated<ShelleyEraOptionDialogContainerData>,
    DaedalusTransferPageProps: ?InjectedOrGenerated<DaedalusTransferPageData>,
    YoroiTransferPageProps: ?InjectedOrGenerated<YoroiTransferPageData>,
    actions: {|
      yoroiTransfer: {|
        startTransferFunds: {|
          trigger: (params: {|
            source: RestoreModeType
          |}) => void
        |}
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any
          |}) => void
        |}
      |}
    |},
    stores: {|
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletTransferPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
      },
      actions: {
        yoroiTransfer: {
          startTransferFunds: { trigger: actions.yoroiTransfer.startTransferFunds.trigger },
        },
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
      },
      ByronEraOptionDialogContainerProps: (
        { actions, stores }: InjectedOrGenerated<ByronEraOptionDialogContainerData>
      ),
      ShelleyEraOptionDialogContainerProps: (
        { actions, stores }: InjectedOrGenerated<ShelleyEraOptionDialogContainerData>
      ),
      YoroiTransferPageProps: (
        { actions, stores }: (?InjectedOrGenerated<YoroiTransferPageData>)
      ),
      DaedalusTransferPageProps: (
        { actions, stores }: (?InjectedOrGenerated<DaedalusTransferPageData>)
      ),
    });
  }
}
