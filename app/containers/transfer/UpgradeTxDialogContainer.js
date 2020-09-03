// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed, } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import LocalizableError from '../../i18n/LocalizableError';
import TransferSendPage from './TransferSendPage';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { formattedWalletAmount } from '../../utils/formatters';
import { addressToDisplayString, } from '../../api/ada/lib/storage/bridge/utils';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import type {
  TransferTx,
} from '../../types/TransferTypes';
import { getApiForNetwork, getApiMeta } from '../../api/common/utils';
import { genAddressLookup, genAddressingLookup, allAddressSubgroups } from '../../stores/stateless/addressStores';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import Dialog from '../../components/widgets/Dialog';
import LegacyTransferLayout from '../../components/transfer/LegacyTransferLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type {
  Addressing,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

export type GeneratedData = typeof UpgradeTxDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
  +onSubmit: void => void,
|};

const messages = defineMessages({
  explanation: {
    id: 'upgradetx.explanation',
    defaultMessage: '!!!We found some ADA in your Byron-era wallet. Would you like to transfer it to your new Shelley wallet?',
  },
});

// TODO: probably a lot of this can be de-duplicated with TransferSendPage
@observer
export default class UpgradeTxDialogContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  submit: {|
    signRequest: HaskellShelleyTxSignRequest,
    publicKey: {|
      key: RustModule.WalletV4.Bip32PublicKey,
      ...Addressing,
    |},
    network: $ReadOnly<NetworkRow>,
    addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
  |} => Promise<void> = async (request) => {
    await this.generated.actions.ada.ledgerSend.sendUsingLedgerKey.trigger({
      ...request,
    });
    this.props.onSubmit();
  }

  render(): Node {
    const { transferRequest } = this.generated.stores.substores.ada.yoroiTransfer;

    const selected = this.generated.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(UpgradeTxDialogContainer)} no wallet selected`);
    }

    // only display the upgrade dialog once we've populated the address info for the wallet
    for (const addressStore of allAddressSubgroups) {
      if (!addressStore.isRelated({ selected })) {
        continue;
      }
      const store = this.generated.stores.addresses.addressSubgroupMap.get(addressStore.class);
      if (store == null) continue;
      if (!store.wasExecuted) {
        return this.getSpinner();
      }
    }
    if (transferRequest.result == null) {
      return this.getSpinner();
    }
    return this.getContent(transferRequest.result);
  }

  getSpinner: void => Node = () => {
    const { intl } = this.context;
    return (
      <Dialog
        title={intl.formatMessage(globalMessages.processingLabel)}
        closeOnOverlayClick={false}
      >
        <LegacyTransferLayout>
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </LegacyTransferLayout>
      </Dialog>
    );
  }

  toTransferTx: HaskellShelleyTxSignRequest => TransferTx = (
    tentativeTx
  ) => {
    if (!(tentativeTx instanceof HaskellShelleyTxSignRequest)) {
      throw new Error(`${nameof(UpgradeTxDialogContainer)} incorrect tx type`);
    }

    return {
      recoveredBalance: tentativeTx.totalOutput(true).plus(tentativeTx.fee(true)),
      fee: tentativeTx.fee(true),
      senders: tentativeTx
        .uniqueSenderAddresses(),
      receivers: tentativeTx
        .receivers(true),
    };
  };

  getContent: {|
    signRequest: HaskellShelleyTxSignRequest,
    publicKey: {|
      key: RustModule.WalletV4.Bip32PublicKey,
      ...Addressing,
    |}
  |} => Node = (
    tentativeTx
  ) => {
    const transferTx = this.toTransferTx(tentativeTx.signRequest);

    const selected = this.generated.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(UpgradeTxDialogContainer)} no wallet selected`);
    }
    const network = selected.getParent().getNetworkInfo();

    const api = getApiForNetwork(network);
    const apiMeta = getApiMeta(api);
    if (apiMeta == null) throw new Error(`${nameof(UpgradeTxDialogContainer)} no API selected`);

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore.getCurrentPrice(
          apiMeta.meta.primaryTicker,
          this.generated.stores.profile.unitOfAccount.currency
        )
      )
      : null;

    const { intl } = this.context;
    const header = (
      <div>
        {intl.formatMessage(messages.explanation)}
        <br /><br />
      </div>
    );

    return (
      <TransferSummaryPage
        header={header}
        form={undefined}
        formattedWalletAmount={amount => formattedWalletAmount(
          amount,
          apiMeta.meta.decimalPlaces.toNumber(),
        )}
        selectedExplorer={this.generated.stores.explorers.selectedExplorer
          .get(network.NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
        }
        transferTx={transferTx}
        onSubmit={{
          trigger: async () => await this.submit({
            network,
            addressingMap: genAddressingLookup(
              selected,
              this.generated.stores.addresses.addressSubgroupMap
            ),
            ...tentativeTx
          }),
          label: intl.formatMessage(globalMessages.upgradeLabel),
        }}
        isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
        onCancel={{
          trigger: this.props.onClose,
          label: intl.formatMessage(globalMessages.skipLabel),
        }}
        error={this.generated.stores.wallets.sendMoneyRequest.error}
        dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        coinPrice={coinPrice}
        unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
        addressLookup={genAddressLookup(
          selected,
          intl,
          undefined, // don't want to go to route from within a dialog
          this.generated.stores.addresses.addressSubgroupMap,
        )}
        addressToDisplayString={
          addr => addressToDisplayString(addr, selected.getParent().getNetworkInfo())
        }
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      ada: {|
        ledgerSend: {|
          sendUsingLedgerKey: {|
            trigger: {|
              signRequest: HaskellShelleyTxSignRequest,
              publicKey: {|
                key: RustModule.WalletV4.Bip32PublicKey,
                ...Addressing,
              |},
              addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
              network: $ReadOnly<NetworkRow>,
            |} => Promise<void>,
          |},
        |},
      |},
    |},
    stores: {|
      addresses: {|
        addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
      |},
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?number
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        unitOfAccount: UnitOfAccountSettingType
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void
        |},
      |},
      substores: {|
        ada: {|
          yoroiTransfer: {|
            transferRequest: {|
              reset: void => void,
              error: ?LocalizableError,
              result: ?{|
                publicKey: {|
                  key: RustModule.WalletV4.Bip32PublicKey,
                  ...Addressing,
                |},
                signRequest: HaskellShelleyTxSignRequest,
              |}
            |},
          |},
        |},
      |},
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(UpgradeTxDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      actions: {
        ada: {
          ledgerSend: {
            sendUsingLedgerKey: {
              trigger: actions.ada.ledgerSend.sendUsingLedgerKey.trigger,
            },
          },
        },
      },
      stores: {
        addresses: {
          addressSubgroupMap: stores.addresses.addressSubgroupMap,
        },
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        wallets: {
          selected: stores.wallets.selected,
          sendMoneyRequest: {
            reset: stores.wallets.sendMoneyRequest.reset,
            error: stores.wallets.sendMoneyRequest.error,
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
          },
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        substores: {
          ada: {
            yoroiTransfer: {
              transferRequest: {
                error: stores.substores.ada.yoroiTransfer.transferRequest.error,
                result: stores.substores.ada.yoroiTransfer.transferRequest.result,
                reset: stores.substores.ada.yoroiTransfer.transferRequest.reset,
              },
            },
          },
        },
      },
    });
  }
}
