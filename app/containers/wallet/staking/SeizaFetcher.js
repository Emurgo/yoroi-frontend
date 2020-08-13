// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import { computed, action, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { intlShape, } from 'react-intl';
import DelegationTxDialog from '../../../components/wallet/staking/DelegationTxDialog';
import { getJormungandrTxFee } from '../../../api/jormungandr/lib/transactions/JormungandrTxSignRequest';
import AnnotatedLoader from '../../../components/transfer/AnnotatedLoader';
import ErrorBlock from '../../../components/widgets/ErrorBlock';
import Dialog from '../../../components/widgets/Dialog';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import DelegationSuccessDialog from '../../../components/wallet/staking/DelegationSuccessDialog';
import globalMessages from '../../../i18n/global-messages';
import InvalidURIImg from '../../../assets/images/uri/invalid-uri.inline.svg';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { PoolRequest } from '../../../api/jormungandr/lib/storage/bridge/delegationUtils';
import LocalizableError from '../../../i18n/LocalizableError';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import {
  EPOCH_REWARD_DENOMINATOR,
} from '../../../config/numbersConfig';
import type { ConfigType } from '../../../../config/config-types';
import type { SelectedPool } from '../../../actions/jormungandr/delegation-transaction-actions';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type {
  CreateDelegationTxFunc,
} from '../../../api/jormungandr/index';
import { getApiForNetwork, getApiMeta } from '../../../api/common/utils';
import { WalletTypeOption, } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';

declare var CONFIG: ConfigType;

export type GeneratedData = typeof SeizaFetcher.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
  +stakingUrl: string,
|};

@observer
export default class SeizaFetcher extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  @observable iframe: ?HTMLIFrameElement;
  @observable frameHeight: number = 0;

  @action
  messageHandler: any => Promise<void> = async (event: any) => {
    if (event.origin !== process.env.SEIZA_FOR_YOROI_URL) return;
    const pools: Array<SelectedPool> = JSON.parse(decodeURI(event.data));

    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return;
    }
    const delegationTxActions = this.generated.actions.jormungandr.delegationTransaction;
    await delegationTxActions.createTransaction.trigger({
      poolRequest: { id: pools[0].poolHash },
      publicDeriver: selectedWallet,
    });
    delegationTxActions.setPools.trigger(pools);
  }

  @action setFrame: (null | HTMLIFrameElement) => void = (frame) => {
    this.iframe = frame;
  }

  constructor(props: Props) {
    super(props);
    window.addEventListener('message', this.messageHandler, false);
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('message', this.messageHandler);
  }

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  cancel: void => void = () => {
    this.generated.actions.jormungandr.delegationTransaction.setPools.trigger([]);
    this.generated.actions.jormungandr.delegationTransaction.reset.trigger();
  }

  render(): Node {
    const { stakingUrl } = this.props;

    if (stakingUrl == null) {
      throw new Error('Staking undefined SEIZA_FOR_YOROI_URL should never happen');
    }

    return (
      <>
        {this.getDialog()}
        <iframe
          ref={this.setFrame}
          title="Staking"
          src={`${stakingUrl}`}
          frameBorder="0"
          width="100%"
          height={this.iframe != null && this.frameHeight != null ? this.frameHeight + 'px' : null}
        />
      </>
    );
  }

  getDialog: void => ?Node = () => {
    const { actions, stores } = this.generated;
    const { intl } = this.context;
    const { profile } = stores;
    const delegationTxStore = stores.substores.jormungandr.delegationTransaction;
    const delegationTxActions = actions.jormungandr.delegationTransaction;

    const delegationTx = delegationTxStore.createDelegationTx.result;

    const dialogBackButton = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: this.cancel,
        primary: true,
      },
    ];

    const showSignDialog = this.generated.stores.wallets.sendMoneyRequest.isExecuting ||
      !this.generated.stores.wallets.sendMoneyRequest.wasExecuted ||
      this.generated.stores.wallets.sendMoneyRequest.error != null;

    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }

    const networkInfo = selectedWallet.getParent().getNetworkInfo();
    const apiMeta = getApiMeta(getApiForNetwork(networkInfo))?.meta;
    if (apiMeta == null) throw new Error(`${nameof(SeizaFetcher)} no API selected`);
    const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);

    const currentParams = networkInfo.BaseConfig
      .reduce((acc, next) => Object.assign(acc, next), {});

    const approximateReward: BigNumber => BigNumber = (amount) => {
      const rewardMultiplier = (number) => number
        .times(currentParams.PerEpochPercentageReward)
        .div(EPOCH_REWARD_DENOMINATOR);

      const result = rewardMultiplier(amount)
        .div(amountPerUnit);
      return result;
    };

    if (
      delegationTxStore.createDelegationTx.isExecuting ||
      (delegationTx == null && delegationTxStore.selectedPools.length >= 1)
    ) {
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
        >
          <AnnotatedLoader
            title={intl.formatMessage(globalMessages.processingLabel)}
            details={intl.formatMessage(globalMessages.txGeneration)}
          />
        </Dialog>
      );
    }
    if (delegationTxStore.createDelegationTx.error != null) {
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.errorLabel)}
          closeOnOverlayClick={false}
          onClose={this.cancel}
          closeButton={<DialogCloseButton onClose={this.cancel} />}
          actions={dialogBackButton}
        >
          <>
            <center><InvalidURIImg /></center>
            <ErrorBlock
              error={delegationTxStore.createDelegationTx.error}
            />
          </>
        </Dialog>
      );
    }
    if (delegationTx != null && delegationTxStore.selectedPools.length >= 1 && showSignDialog) {
      return (
        <DelegationTxDialog
          staleTx={delegationTxStore.isStale}
          poolName={delegationTxStore.selectedPools[0].name}
          poolHash={delegationTxStore.selectedPools[0].poolHash}
          transactionFee={getJormungandrTxFee(delegationTx.signTxRequest.self().unsignedTx, true)}
          amountToDelegate={delegationTx.totalAmountToDelegate}
          approximateReward={approximateReward(delegationTx.totalAmountToDelegate)}
          isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
          isHardware={
            selectedWallet.getParent().getWalletType() === WalletTypeOption.HARDWARE_WALLET
          }
          onCancel={this.cancel}
          onSubmit={({ password }) => delegationTxActions.signTransaction.trigger({
            password,
            publicDeriver: selectedWallet,
          })}
          classicTheme={profile.isClassicTheme}
          error={this.generated.stores.wallets.sendMoneyRequest.error}
          selectedExplorer={stores.explorers.selectedExplorer
            .get(
              selectedWallet.getParent().getNetworkInfo().NetworkId
            ) ?? (() => { throw new Error('No explorer for wallet network'); })()
          }
          meta={{
            decimalPlaces: apiMeta.decimalPlaces.toNumber(),
            totalSupply: apiMeta.totalSupply,
          }}
        />
      );
    }
    if (delegationTx != null && !showSignDialog) {
      return (
        <DelegationSuccessDialog
          onClose={delegationTxActions.complete.trigger}
          classicTheme={profile.isClassicTheme}
        />
      );
    }
    return undefined;
  }

  @action
  resize: void => void = () => {
    if (this.iframe == null) {
      this.frameHeight = 0;
      return;
    }
    this.frameHeight = Math.max(
      window.innerHeight - this.iframe.getBoundingClientRect().top - 30,
      0
    );
  }

  @computed get generated(): {|
    actions: {|
      jormungandr: {|
        delegationTransaction: {|
          complete: {|
            trigger: void => void
          |},
          createTransaction: {|
            trigger: (params: {|
              poolRequest: PoolRequest,
              publicDeriver: PublicDeriver<>
            |}) => Promise<void>
          |},
          reset: {| trigger: (params: void) => void |},
          setPools: {|
            trigger: (params: Array<SelectedPool>) => void
          |},
          signTransaction: {|
            trigger: (params: {|
              password?: string,
              publicDeriver: PublicDeriver<>
            |}) => Promise<void>
          |}
        |}
      |}
    |},
    stores: {|
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
      |},
      substores: {|
        jormungandr: {|
          delegationTransaction: {|
            createDelegationTx: {|
              error: ?LocalizableError,
              isExecuting: boolean,
              result: ?PromisslessReturnType<CreateDelegationTxFunc>
            |},
            isStale: boolean,
            selectedPools: Array<SelectedPool>,
          |}
        |}
      |},
      wallets: {|
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          wasExecuted: boolean
        |},
        selected: null | PublicDeriver<>
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SeizaFetcher)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const delegationTxStore = stores.substores.jormungandr.delegationTransaction;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        wallets: {
          selected: stores.wallets.selected,
          sendMoneyRequest: {
            error: stores.wallets.sendMoneyRequest.error,
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
            wasExecuted: stores.wallets.sendMoneyRequest.wasExecuted,
          },
        },
        substores: {
          jormungandr: {
            delegationTransaction: {
              selectedPools: delegationTxStore.selectedPools,
              isStale: delegationTxStore.isStale,
              createDelegationTx: {
                result: delegationTxStore.createDelegationTx.result,
                error: delegationTxStore.createDelegationTx.error,
                isExecuting: delegationTxStore.createDelegationTx.isExecuting,
              },
            },
          },
        },
      },
      actions: {
        jormungandr: {
          delegationTransaction: {
            createTransaction: {
              trigger: actions.jormungandr.delegationTransaction.createTransaction.trigger,
            },
            signTransaction: {
              trigger: actions.jormungandr.delegationTransaction.signTransaction.trigger,
            },
            reset: {
              trigger: actions.jormungandr.delegationTransaction.reset.trigger,
            },
            complete: {
              trigger: actions.jormungandr.delegationTransaction.complete.trigger,
            },
            setPools: {
              trigger: actions.jormungandr.delegationTransaction.setPools.trigger,
            },
          },
        },
      },
    });
  }
}
