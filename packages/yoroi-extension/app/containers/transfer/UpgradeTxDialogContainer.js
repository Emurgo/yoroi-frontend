// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { addressToDisplayString, } from '../../api/ada/lib/storage/bridge/utils';
import type {
  TransferTx,
} from '../../types/TransferTypes';
import { genAddressLookup, genAddressingLookup, allAddressSubgroups } from '../../stores/stateless/addressStores';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import Dialog from '../../components/widgets/Dialog';
import LegacyTransferLayout from '../../components/transfer/LegacyTransferLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type {
  Addressing,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { getTokenName, genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';

type Props = {|
  ...StoresAndActionsProps,
  +onClose: void => void,
  +onSubmit: void => void,
|};

const messages = defineMessages({
  explanation: {
    id: 'upgradetx.explanation',
    defaultMessage: '!!!We found some {ticker} in your Byron-era wallet. Would you like to transfer it to your new Shelley wallet?',
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
    publicDeriver: PublicDeriver<>,
    addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
    expectedSerial: string | void,
  |} => Promise<void> = async (request) => {
    await this.props.actions.ada.ledgerSend.sendUsingLedgerKey.trigger({
      ...request,
    });
    this.props.onSubmit();
  }

  render(): Node {
    const { transferRequest } = this.props.stores.substores.ada.yoroiTransfer;

    const selected = this.props.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(UpgradeTxDialogContainer)} no wallet selected`);
    }

    // only display the upgrade dialog once we've populated the address info for the wallet
    for (const addressStore of allAddressSubgroups) {
      if (!addressStore.isRelated({ selected })) {
        continue;
      }
      const store = this.props.stores.addresses.addressSubgroupMap.get(addressStore.class);
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
      recoveredBalance: tentativeTx.totalOutput().joinAddCopy(tentativeTx.fee()),
      fee: tentativeTx.fee(),
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

    const selected = this.props.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(UpgradeTxDialogContainer)} no wallet selected`);
    }
    const network = selected.getParent().getNetworkInfo();
    const defaultToken = selected.getParent().getDefaultToken();
    const defaultTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)({
      identifier: defaultToken.defaultIdentifier,
      networkId: defaultToken.defaultNetworkId,
    });

    const { intl } = this.context;
    const header = (
      <div>
        {intl.formatMessage(
          messages.explanation,
          { ticker: truncateToken(getTokenName(defaultTokenInfo)) }
        )}
        <br /><br />
      </div>
    );

    const expectedSerial = selected.getParent().hardwareInfo?.DeviceId || '';

    return (
      <TransferSummaryPage
        header={header}
        form={undefined}
        selectedExplorer={this.props.stores.explorers.selectedExplorer
          .get(network.NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
        }
        transferTx={transferTx}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        onSubmit={{
          trigger: async () => await this.submit({
            publicDeriver: selected,
            addressingMap: genAddressingLookup(
              selected,
              this.props.stores.addresses.addressSubgroupMap
            ),
            ...tentativeTx,
            expectedSerial,
          }),
          label: intl.formatMessage(globalMessages.upgradeLabel),
        }}
        isSubmitting={this.props.stores.wallets.sendMoneyRequest.isExecuting}
        onCancel={{
          trigger: this.props.onClose,
          label: intl.formatMessage(globalMessages.skipLabel),
        }}
        error={this.props.stores.wallets.sendMoneyRequest.error}
        dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
        unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
        addressLookup={genAddressLookup(
          selected,
          intl,
          undefined, // don't want to go to route from within a dialog
          this.props.stores.addresses.addressSubgroupMap,
        )}
        addressToDisplayString={
          addr => addressToDisplayString(addr, selected.getParent().getNetworkInfo())
        }
      />
    );
  }
}
