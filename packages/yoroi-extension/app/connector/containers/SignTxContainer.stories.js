// @flow

import type { Node, ComponentType } from 'react';
import SignTxContainer from './SignTxContainer';
import { withScreenshot } from 'storycap';
import { action } from '@storybook/addon-actions';
import { MemoryRouter } from 'react-router';
import Layout from '../components/layout/Layout';
import { mockFromDefaults, getDefaultEntryTokenInfo, } from '../../stores/toplevel/TokenInfoStore';
import { defaultAssets, } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  genErgoSigningWalletWithCache,
  genTentativeErgoTx,
} from '../../../stories/helpers/ergo/ErgoMocks';
import { MultiToken } from '../../api/common/lib/MultiToken';
import BigNumber from 'bignumber.js';
import { decodeErgoTokenInfo } from '../../api/ergo/lib/state-fetch/mockNetwork';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import {
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';

export default {
  title: `${__filename.split('.')[0]}`,
  component: SignTxContainer,
  decorators: [
    (Story: ComponentType<any>): Node => (
      <MemoryRouter>
        <Layout>
          <Story />
        </Layout>
      </MemoryRouter>
    ),
    withScreenshot,
  ],
};

const tokenInfo = {
  registers: {
    'R4': '0e03555344',
    'R5': '0e184e6f7468696e67206261636b65642055534420746f6b656e',
    'R6': '0e0132',
  },
  tokenId: '33a35e15ae1a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
};

const message = (id: number) => ({
  publicDeriverId: id,
  sign: {
    type: 'tx',
    uid: 0,
    tx: {
      inputs: [{
        boxId: '1df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a174',
        extension: {},
        value: '100001',
        transactionId: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
        index: 0,
        creationHeight: 1,
        ergoTree: Buffer.from(RustModule.SigmaRust.Address.from_base58(
          '9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ'
        ).to_ergo_tree().sigma_serialize_bytes()).toString('hex'),
        assets: [],
        additionalRegisters: Object.freeze({}),
      }],
      dataInputs: [{
        boxId: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
      }],
      outputs: [{
        value: '1234567',
        ergoTree: Buffer.from(RustModule.SigmaRust.Address.from_base58(
          '9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ'
        ).to_ergo_tree().sigma_serialize_bytes()).toString('hex'),
        assets: [{
          amount: '12340',
          tokenId: tokenInfo.tokenId,
        }],
        additionalRegisters: tokenInfo.registers,
        creationHeight: 1
      }],
    },
  },
  tabId: 0,
});

const genBaseProps: {|
  wallet: *,
  isLoading?: true,
|} => * = (request) => {
  const parsedTokenMetadata = decodeErgoTokenInfo(tokenInfo.registers);
  const customAsset = {
    NetworkId: request.wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
    Identifier: 'f2b5c4e4883555b882e3a5919967883aade9e0494290f29e0e3069f5ce9eabe4',
    IsDefault: false,
    IsNFT: false,
    Metadata: {
      type: 'Ergo',
      height: 0,
      boxId: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
      ticker: null,
      longName: parsedTokenMetadata.name,
      numberOfDecimals: parsedTokenMetadata.numDecimals || 0,
      description: parsedTokenMetadata.desc,
    }
  };

  const { tentativeTx, } = genTentativeErgoTx(
    request.wallet.publicDeriver
  );

  return {
    stores: {
      connector: {
        signingRequest: tentativeTx,
        signingMessage: message(request.wallet.publicDeriver.getPublicDeriverId()),
        filteredWallets: request.isLoading
          ? []
          : [{
            publicDeriver: request.wallet.publicDeriver,
            name: 'Storybook wallet A',
            balance: new MultiToken([{
              amount: new BigNumber('1234'),
              identifier:
                request.wallet.publicDeriver.getParent().getDefaultToken().defaultIdentifier,
              networkId:
                request.wallet.publicDeriver.getParent().getDefaultToken().defaultNetworkId,
            }], request.wallet.publicDeriver.getParent().getDefaultToken()),
            checksum: {
              ImagePart: '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
              TextPart: 'XLBS-6706',
            }
          }],
        adaTransaction: null,
        currentConnectorWhitelist: [],
        submissionError: null,
        hwWalletError: null,
        isHwWalletErrorRecoverable: null,
      },
      coinPriceStore: {
        getCurrentPrice: (_from, _to) => '5',
      },
      explorers: {
        selectedExplorer: defaultToSelectedExplorer(),
      },
      profile: {
        unitOfAccount: genUnitOfAccount(),
        shouldHideBalance: false,
      },
      uiNotifications: {
        getTooltipActiveNotification: (_id) => undefined,
        isOpen: (_clazz) => false,
      },
      tokenInfoStore: {
        tokenInfo: mockFromDefaults([...defaultAssets, customAsset]),
        getDefaultTokenInfo: networkId => getDefaultEntryTokenInfo(
          networkId,
          mockFromDefaults([...defaultAssets, customAsset])
        ),
      },
    },
    actions: {
      notifications: {
        closeActiveNotification: {
          trigger: action('closeActiveNotification'),
        },
        open: {
          trigger: action('open'),
        },
      },
      connector: {
        refreshWallets: { trigger: async (req) => action('refreshWallets')(req) },
        cancelSignInTx: {
          trigger: action('cancelSignInTx'),
        },
        confirmSignInTx: {
          trigger: async () => action('confirmSignInTx')(),
        },
      },
    },
  };
};

export const Loading = (): Node => {
  const wallet = genErgoSigningWalletWithCache();
  return (
    <SignTxContainer
      generated={genBaseProps(Object.freeze({ wallet, isLoading: true }))}
    />
  );
};


export const Generic = (): Node => {
  const wallet = genErgoSigningWalletWithCache();
  return (
    <SignTxContainer
      generated={genBaseProps(Object.freeze({ wallet }))}
    />
  );
};
