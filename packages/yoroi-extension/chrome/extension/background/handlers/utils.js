// @flow

import type { PublicDeriver } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import type { WalletState } from '../types';
import {
  asDisplayCutoff,
  asGetAllUtxos,
  asHasLevels,
  asGetPublicKey,
  asGetSigningKey,
  asGetStakingKey,
  asHasUtxoChains,
  asGetBalance,
} from '../../../../app/api/ada/lib/storage/models/PublicDeriver/traits'
import { getWalletChecksum } from '../../../../app/api/export/utils';
import { getReceiveAddress } from '../../../../app/stores/stateless/addressStores';
import { assuranceModes } from '../../../../app/config/transactionAssuranceConfig';
import { getChainAddressesForDisplay, } from '../../../../app/api/ada/lib/storage/models/utils';
import { CoreAddressTypes } from '../../../../app/api/ada/lib/storage/database/primitives/enums';
import { ChainDerivations } from '../../../../app/config/numbersConfig';
import {
  getAllAddressesForWallet,
  getAllAddressesForDisplay,
} from '../../../../app/api/ada/lib/storage/bridge/traitUtils';
import { getForeignAddresses } from '../../../../app/api/ada/lib/storage/bridge/updateTransactions';
import {
  isLedgerNanoWallet,
  isTrezorTWallet
} from '../../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import { Bip44Wallet } from '../../../../app/api/ada/lib/storage/models/Bip44Wallet/wrapper';
import {
  isTestnet,
  isCardanoHaskell,
  getCardanoHaskellBaseConfig,
} from '../../../../app/api/ada/lib/storage/database/prepackaged/networks';
import AdaApi from '../../../../app/api/ada';
import BigNumber from 'bignumber.js';
import { asAddressedUtxo, cardanoValueFromRemoteFormat } from '../../../../app/api/ada/transactions/utils';
import { MultiToken } from '../../../../app/api/common/lib/MultiToken';
import { RustModule } from '../../../../app/api/ada/lib/cardanoCrypto/rustLoader';

export async function getWalletState(publicDeriver: PublicDeriver<>): Promise<WalletState> {
  return RustModule.WasmScope(async ({ WalletV4 }) => {
    const conceptualWalletInfo = await publicDeriver.getParent().getFullConceptualWalletInfo();
    const network = publicDeriver.getParent().getNetworkInfo();

    const type = (() => {
      if (isLedgerNanoWallet(publicDeriver.getParent())) {
        return 'ledger';
      } else if (isTrezorTWallet(publicDeriver.getParent())) {
        return 'trezor';
      }
      return 'mnemonic';
    })();

    const withUtxos = asGetAllUtxos(publicDeriver);
    if (withUtxos == null) {
      throw new Error('unexpected missing asGetAllUtxos result');
    }
    const utxos = await withUtxos.getAllUtxos();
    const addressedUtxos = asAddressedUtxo(utxos).filter(u => u.assets.length > 0);
    //   // <TODO:PLUTUS_SUPPORT>
    const utxoHasDataHash = false;
    const config = getCardanoHaskellBaseConfig(network).reduce(
      (acc, next) => Object.assign(acc, next),
      {}
    );
    const coinsPerUtxoWord = WalletV4.BigNum.from_str(config.CoinsPerUtxoWord);
    const deposits: Array<RustModule.WalletV4.BigNum> = addressedUtxos.map(u => {
      try {
        return WalletV4.min_ada_required(
          // $FlowFixMe[prop-missing]
          cardanoValueFromRemoteFormat(u),
          utxoHasDataHash,
          coinsPerUtxoWord
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(
          `Failed to calculate min-required ADA for utxo: ${JSON.stringify(u)}`,
          e
        );
        return WalletV4.BigNum.zero();
      }
    });
    const sumDeposit = deposits.reduce((a, b) => a.checked_add(b), WalletV4.BigNum.zero());
    const defaultTokenId = publicDeriver.getParent().getDefaultMultiToken().defaults.defaultIdentifier;
    const assetDeposits =  new MultiToken(
      [
        {
          identifier: defaultTokenId,
          amount: new BigNumber(sumDeposit.to_str()),
          networkId: network.NetworkId,
        },
      ],
      {
        defaultNetworkId: network.NetworkId,
        defaultIdentifier: defaultTokenId,
      }
    );

    const withPubKey = asGetPublicKey(publicDeriver);
    if (withPubKey == null) {
      throw new Error('unexpected missing asGetPublicKey result');
    }
    const publicKey = await withPubKey.getPublicKey();
    const plate = await getWalletChecksum(withPubKey);
    
    const receiveAddress = await getReceiveAddress(publicDeriver);
    if (receiveAddress == null) {
      throw new Error('unexpected missing receive address');
    }

    let signingKeyUpdateDate =
        (await asGetSigningKey(publicDeriver)?.getSigningKey())?.row.PasswordLastUpdate?.toISOString()
        || null;

    const withStakingKey = asGetStakingKey(publicDeriver);
    if (withStakingKey == null) {
      throw new Error('unexpected missing asGetAllAccounting result');
    }
    const stakingKeyDbRow = await withStakingKey.getStakingKey();

    const adaApi = new AdaApi();

    const withUtxoChains = asHasUtxoChains(publicDeriver);
    if (withUtxoChains == null) {
      throw new Error('unexpected missing asHasUtxoChains result');
    }
    const allAddressesByType = [];
    const externalAddressesByType = [];
    const internalAddressesByType = [];

    for (let typeName of Object.keys(CoreAddressTypes)) {
      const type = CoreAddressTypes[typeName];

      allAddressesByType[type] = await getAllAddressesForDisplay({
        publicDeriver,
        type
      });
      externalAddressesByType[type] = await getChainAddressesForDisplay({
        publicDeriver: withUtxoChains,
        chainsRequest: { chainId: ChainDerivations.EXTERNAL },
        type
      });
      internalAddressesByType[type] = await getChainAddressesForDisplay({
        publicDeriver: withUtxoChains,
        chainsRequest: { chainId: ChainDerivations.INTERNAL },
        type
      });
    }
    const allAddresses = await getAllAddressesForWallet(publicDeriver);

    const withLevels = asHasLevels(publicDeriver);
    if (withLevels == null) {
      throw new Error('unexpected missing asHasLevels result');
    }
    const foreignAddresses = await getForeignAddresses({ publicDeriver: withLevels });

    const allUtxoAddresses = await withUtxos.getAllUtxoAddresses();

    const canGetBalance = asGetBalance(publicDeriver);
    if (canGetBalance == null) {
      throw new Error('unexpected missing asGetBalance result');
    }
    const balance = await canGetBalance.getBalance();

    return {
      publicDeriverId: publicDeriver.getPublicDeriverId(),
      conceptualWalletId: publicDeriver.getParent().getConceptualWalletId(),
      utxos,
      transactions: [], // fixme
      networkId: network.NetworkId,
      name: conceptualWalletInfo.Name,
      type,
      hardwareWalletDeviceId: publicDeriver.getParent().hardwareInfo?.DeviceId,
      plate,
      publicKey: publicKey.Hash,
      receiveAddress,
      pathToPublic: withPubKey.pathToPublic,
      signingKeyUpdateDate,
      stakingAddressing: { addressing: stakingKeyDbRow.addressing },
      stakingAddress: stakingKeyDbRow.addr.Hash,
      publicDeriverLevel: withLevels.getParent().getPublicDeriverLevel(),
      lastSyncInfo: await publicDeriver.getLastSyncInfo(),
      balance,
      assetDeposits,
      defaultTokenId,
      assuranceMode: assuranceModes.NORMAL,
      allAddressesByType,
      foreignAddresses,
      externalAddressesByType,
      internalAddressesByType,
      allAddresses,
      allUtxoAddresses,
      isBip44Wallet: publicDeriver.getParent() instanceof Bip44Wallet,
      isTestnet: isTestnet(network),
      isCardanoHaskell: isCardanoHaskell(network),
      isRefreshing: false, // fixme
    };
  });
}
