// @flow

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ThemeProvider } from 'react-polymorph/lib/components/ThemeProvider';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ko from 'react-intl/locale-data/ko';
import ja from 'react-intl/locale-data/ja';
import zh from 'react-intl/locale-data/zh';
import ru from 'react-intl/locale-data/ru';
import de from 'react-intl/locale-data/de';
import fr from 'react-intl/locale-data/fr';
import id from 'react-intl/locale-data/id';
import es from 'react-intl/locale-data/es';
import it from 'react-intl/locale-data/it';
import '../../app/themes/index.global.scss';
import {
  genToAbsoluteSlotNumber,
  genToRelativeSlotNumber,
  genTimeToSlot,
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeSinceGenesis,
  genToRealTime,
} from '../../app/api/ada/lib/storage/bridge/timeUtils';
import { yoroiPolymorphTheme } from '../../app/themes/PolymorphThemes';
import { themeOverrides } from '../../app/themes/overrides';
import { translations, LANGUAGES } from '../../app/i18n/translations';
import ThemeManager from '../../app/ThemeManager';
import { THEMES, changeToplevelTheme } from '../../app/themes';
import type { Theme } from '../../app/themes';
import environment from '../../app/environment';
import { getVarsForTheme } from '../../app/stores/toplevel/ProfileStore';
import type { HwWalletMetaRow, } from '../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import { assuranceModes } from '../../app/config/transactionAssuranceConfig';

import { withKnobs, select, boolean } from '@storybook/addon-knobs';
import { addDecorator } from '@storybook/react';

import { PublicDeriver } from '../../app/api/ada/lib/storage/models/PublicDeriver';
import { Cip1852Wallet } from '../../app/api/ada/lib/storage/models/Cip1852Wallet/wrapper';
import { WalletTypeOption } from '../../app/api/ada/lib/storage/models/ConceptualWallet/interfaces';
import {
  HasPrivateDeriver,
  HasSign,
  HasLevels,
  GetAllUtxos,
  GetSigningKey,
  GetPublicKey,
  DisplayCutoff,
  Cip1852PickInternal,
  GetAllAccounting,
  GetStakingKey,
  HasUtxoChains,
} from '../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import {
  Bip44DerivationLevels,
} from '../../app/api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import type { ConceptualWalletSettingsCache } from '../../app/stores/base/WalletSettingsStore';
import WalletSettingsStore from '../../app/stores/base/WalletSettingsStore';
import TransactionsStore from '../../app/stores/base/TransactionsStore';
import DelegationStore from '../../app/stores/ada/DelegationStore';
import WalletStore from '../../app/stores/toplevel/WalletStore';
import TimeStore from '../../app/stores/ada/TimeStore';
import CachedRequest from '../../app/stores/lib/LocalizedCachedRequest';
import LocalizableError from '../../app/i18n/LocalizableError';
import globalMessages from '../../app/i18n/global-messages';
import { ledgerErrors } from '../../app/domain/LedgerLocalizedError';
import BigNumber from 'bignumber.js';
import { utxoToTxInput } from '../../app/api/ada/transactions/shelley/inputSelection';
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';

/**
 * This whole file is meant to mirror code in App.js
 */

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([...en, ...ko, ...ja, ...zh, ...ru, ...de, ...fr, ...id, ...es, ...it]);

addDecorator(withKnobs);

const themeNames = Object.values(THEMES);

const langCode = LANGUAGES.map(item => item.value);

type Props = { +children: any, ... };

environment.isShelley = () => boolean('IsJormungandr', true);
environment.isNightly = () => boolean('IsNightly', false);

export const globalKnobs: {|
  locale: void => string,
  currentTheme: void => Theme,
|} = {
  // needs to use functions for storybook to work properly
  locale: () => select('Language', langCode, langCode[0]),
  currentTheme: () => select('Theme', themeNames, THEMES.YOROI_MODERN),
};

export const isFirefoxKnob: void => boolean = () => {
  const firefox = boolean('isFirefox', false);
  environment.userAgentInfo.isFirefox = firefox;
  return firefox;
};

@observer
export default class StoryWrapper extends Component<Props> {

  render() {
    const { children: Story } = this.props;
    const locale = globalKnobs.locale();
    const currentTheme = globalKnobs.currentTheme();

    // Merged english messages with selected by user locale messages
    // In this case all english data would be overridden to user selected locale, but untranslated
    // (missed in object keys) just stay in english
    // eslint-disable-next-line prefer-object-spread
    const mergedMessages = Object.assign({}, translations['en-US'], translations[locale]);

    // eslint-disable-next-line prefer-object-spread
    const themeVars = getVarsForTheme({ theme: currentTheme });

    changeToplevelTheme(currentTheme);

    return (
      <div style={{ height: 'calc(100vh)' }}>
        <ThemeManager variables={themeVars} />

        {/* Automatically pass a theme prop to all components in this subtree. */}
        <ThemeProvider
          key={currentTheme}
          theme={yoroiPolymorphTheme}
          themeOverrides={themeOverrides(currentTheme)}
        >
          <IntlProvider {...{
            locale,
            key: locale,
            messages: mergedMessages
          }}
          >
            <Story />
          </IntlProvider>
        </ThemeProvider>
      </div>
    );
  }
}

export function getMnemonicCases(length: number): {|
  Empty: string,
  Partial: string,
  Invalid: string,
  Correct: string,
|} {
  if (length === 21) {
    return {
      Empty: '',
      Partial: 'lamp',
      Invalid: 'lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp',
      Correct: 'slab spend fabric danger truly between delay like before sword prefer camera reject offer minor caught pitch shoe jewel wine lawn',
    };
  }
  if (length === 15) {
    return {
      Empty: '',
      Partial: 'lamp',
      Invalid: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon',
      Correct: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share',
    };
  }
  throw new Error(`${nameof(getMnemonicCases)} Unexpected length ${length}`);
}
export function getValidationMnemonicCases(length: number): {|
  Empty: string,
  Partial: string,
  Incorrect: string,
  Invalid: string,
  Correct: string,
|} {
  if (length === 21) {
    return {
      ...getMnemonicCases(21),
      Incorrect: 'clown worth average equal giggle obtain lamp minimum brother replace define glimpse gaze tone mystery people crack wreck grow blanket current',
    };
  }
  if (length === 15) {
    return {
      ...getMnemonicCases(15),
      Incorrect: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon address',
    };
  }
  throw new Error(`${nameof(getMnemonicCases)} Unexpected length ${length}`);
}


export function getPasswordValidationCases(correct: string): {|
  Empty: string,
  Correct: string,
|} {
  return {
    Empty: '',
    Correct: correct,
  };
}

export function getWalletNameCases(): {|
  None: string,
  Valid: string,
  |} {
  return {
    None: '',
    Valid: 'Test wallet',
  };
}

export function getPasswordCreationCases(long?: string): {|
  Empty: string,
  Short: string,
  Long: string,
|} {
  return {
    Empty: '',
    Short: 'a',
    Long: long == null ? 'asdfasdfasdf' : long,
  };
}

export const trezorErrorCases = Object.freeze({
  None: undefined,
  IFrameTimeout: new LocalizableError(globalMessages.trezorError101),
  PermissionError: new LocalizableError(globalMessages.hwError101),
  Cancelled: new LocalizableError(globalMessages.trezorError103),
});

export const ledgerErrorCases = Object.freeze({
  None: undefined,
  U2fTimeout: new LocalizableError(globalMessages.ledgerError101),
  OtherTimeout: new LocalizableError(ledgerErrors.networkError105),
  DeviceRejected: new LocalizableError(ledgerErrors.cancelOnDeviceError101),
  UserRejected: new LocalizableError(ledgerErrors.cancelOnLedgerConnectError102),
  Locked: new LocalizableError(ledgerErrors.deviceLockedError103),
  NotAllowed: new LocalizableError(ledgerErrors.deviceLockedError104),
});

export const mockLedgerMeta = {
  DeviceId: '',
  HwWalletMetaId: 1,
  Label: '',
  Language: '',
  MajorVersion: 1,
  MinorVersion: 0,
  Model: 'NanoS',
  PatchVersion: 0,
  Vendor: 'ledger.com',
};
export const mockTrezorMeta = {
  DeviceId: 'Trezorro',
  HwWalletMetaId: 1,
  Label: 'C875BA9D0C571FF4B8718FAA',
  Language: 'english',
  MajorVersion: 2,
  MinorVersion: 1,
  Model: 'T',
  PatchVersion: 1,
  Vendor: 'trezor.io',
};

let conceptualWalletCounter = 0;
let publicDeriverCounter = 0;

function genDummyWallet(): PublicDeriver<> {
  const conceptualWalletId = conceptualWalletCounter++;
  const parent = new Cip1852Wallet(
    (null: any),
    {
      db: (null: any),
      conceptualWalletId,
      walletType: WalletTypeOption.WEB_WALLET,
      hardwareInfo: null,
    },
    {
      Cip1852WrapperId: 0,
      ConceptualWalletId: conceptualWalletId,
      SignerLevel: null,
      PublicDeriverLevel: 0,
      PrivateDeriverLevel: null,
      PrivateDeriverKeyDerivationId: null,
      RootKeyDerivationId: 0,
    },
    null,
    null,
    0,
  );
  const clazz = GetPublicKey(HasLevels(HasSign(PublicDeriver)));
  const self = new clazz({
    publicDeriverId: publicDeriverCounter++,
    parent,
    pathToPublic: [],
    derivationId: 0,
  });
  return self;
}

function genMockCache(dummyWallet: PublicDeriver<>) {
  const pendingRequest = new CachedRequest(_publicDeriver => Promise.resolve([]));
  const recentRequest = new CachedRequest(_request => Promise.resolve({
    transactions: [],
    total: 0,
  }));
  const allRequest = new CachedRequest(_request => Promise.resolve({
    transactions: [],
    total: 0,
  }));
  const getBalanceRequest = new CachedRequest(_request => Promise.resolve(
    new BigNumber(0),
  ));
  return {
    conceptualWalletCache: {
      conceptualWallet: dummyWallet.getParent(),
      conceptualWalletName: 'Test wallet',
    },
    getPublicKeyCache: (wallet) => ({
      publicDeriver: wallet,
      plate: {
        hash: '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        id: 'DNKO-8098',
      },
    }),
    getDelegation: (_wallet) => (undefined),
    getTransactions: (wallet) => ({
      publicDeriver: wallet,
      lastSyncInfo: {
        BlockHash: null,
        LastSyncInfoId: 1,
        SlotNum: null,
        Height: 0,
        Time: null,
      },
      requests: {
        pendingRequest,
        recentRequest,
        allRequest,
        getBalanceRequest,
      },
    }),
    getPublicDeriverSettingsCache: (publicDeriver) => ({
      publicDeriver,
      assuranceMode: assuranceModes.NORMAL,
      publicDeriverName: '',
    }),
    getSigningKeyCache: (publicDeriver) => ({
      publicDeriver,
      signingKeyUpdateDate: null,
    }),
    getTimeCalcRequests: (publicDeriver) => ({
      publicDeriver,
      requests: {
        toAbsoluteSlot: new CachedRequest(genToAbsoluteSlotNumber),
        toRelativeSlotNumber: new CachedRequest(genToRelativeSlotNumber),
        timeToSlot: new CachedRequest(genTimeToSlot),
        currentEpochLength: new CachedRequest(genCurrentEpochLength),
        currentSlotLength: new CachedRequest(genCurrentSlotLength),
        timeSinceGenesis: new CachedRequest(genTimeSinceGenesis),
        toRealTime: new CachedRequest(genToRealTime),
      },
    }),
    getCurrentTimeRequests: (publicDeriver) => ({
      publicDeriver,
      currentEpoch: 100,
      currentSlot: 5000,
      msIntoSlot: 10,
    }),
  };
}

export function genDummyWithCache(): CacheValue {
  const dummyWallet = genDummyWallet();
  return {
    publicDeriver: dummyWallet,
    ...genMockCache(dummyWallet),
  };
}

function genSigningWallet(
  genHardwareInfo?: number => HwWalletMetaRow,
): PublicDeriver<> {
  const conceptualWalletId = conceptualWalletCounter++;
  const hardwareInfo = genHardwareInfo == null
    ? null
    : genHardwareInfo(conceptualWalletId);
  const parent = new Cip1852Wallet(
    (null: any),
    {
      db: (null: any),
      conceptualWalletId,
      walletType: (() => {
        if (hardwareInfo != null) {
          return WalletTypeOption.HARDWARE_WALLET;
        }
        return WalletTypeOption.WEB_WALLET;
      })(),
      hardwareInfo,
    },
    {
      Cip1852WrapperId: 0,
      ConceptualWalletId: conceptualWalletId,
      SignerLevel: null,
      PublicDeriverLevel: Bip44DerivationLevels.ACCOUNT.level,
      PrivateDeriverLevel: null,
      PrivateDeriverKeyDerivationId: null,
      RootKeyDerivationId: 0,
    },
    null,
    null,
    0,
  );
  const clazz = HasUtxoChains(Cip1852PickInternal(GetStakingKey(GetAllAccounting(
    DisplayCutoff(GetSigningKey(GetPublicKey(
      GetAllUtxos(HasLevels(HasSign(HasPrivateDeriver((PublicDeriver: any)))))
    )))
  ))));
  const self = new clazz({
    publicDeriverId: publicDeriverCounter++,
    parent,
    pathToPublic: [],
    derivationId: 0,
  });
  return self;
}

export function genSigningWalletWithCache(
  genHardwareInfo?: number => HwWalletMetaRow,
): CacheValue {
  const dummyWallet = genSigningWallet(genHardwareInfo);
  return {
    publicDeriver: dummyWallet,
    ...genMockCache(dummyWallet),
  };
}

export type CacheValue = {|
  publicDeriver: PublicDeriver<>,
  conceptualWalletCache: ConceptualWalletSettingsCache,
  getPublicKeyCache:
    typeof WalletStore.prototype.getPublicKeyCache,
  getTransactions:
    typeof TransactionsStore.prototype.getTxRequests,
  getDelegation:
    typeof DelegationStore.prototype.getDelegationRequests,
  getSigningKeyCache:
    typeof WalletStore.prototype.getSigningKeyCache,
  getPublicDeriverSettingsCache:
    typeof WalletSettingsStore.prototype.getPublicDeriverSettingsCache,
  getTimeCalcRequests:
    typeof TimeStore.prototype.getTimeCalcRequests,
  getCurrentTimeRequests:
    typeof TimeStore.prototype.getCurrentTimeRequests,
|};

export function walletLookup(wallets: Array<CacheValue>): {|
  publicDerivers: Array<PublicDeriver<>>,
  getConceptualWalletSettingsCache:
    typeof WalletSettingsStore.prototype.getConceptualWalletSettingsCache,
  getPublicKeyCache:
    typeof WalletStore.prototype.getPublicKeyCache,
  getTransactions:
    typeof TransactionsStore.prototype.getTxRequests,
  getDelegation:
    typeof DelegationStore.prototype.getDelegationRequests,
  getSigningKeyCache:
    typeof WalletStore.prototype.getSigningKeyCache,
  getPublicDeriverSettingsCache:
    typeof WalletSettingsStore.prototype.getPublicDeriverSettingsCache,
  getTimeCalcRequests:
    typeof TimeStore.prototype.getTimeCalcRequests,
  getCurrentTimeRequests:
    typeof TimeStore.prototype.getCurrentTimeRequests,
|} {
  if (wallets.length === 0) {
    return ({
      publicDerivers: [],
      getConceptualWalletSettingsCache: (_conceptualWallet) => (null: any),
      getTransactions: (_publicDeriver) => (null: any),
      getDelegation: (_publicDeriver) => (null: any),
      getPublicKeyCache: (_publicDeriver) => (null: any),
      getSigningKeyCache: (_publicDeriver) => (null: any),
      getPublicDeriverSettingsCache: (_publicDeriver) => (null: any),
      getTimeCalcRequests: (_publicDeriver) => (null: any),
      getCurrentTimeRequests: (_publicDeriver) => (null: any),
    });
  }

  const asOption: { [key: string]: PublicDeriver<>, ... } = {};
  for (const wallet of wallets) {
    asOption[wallet.conceptualWalletCache.conceptualWalletName] = wallet.publicDeriver;
  }

  return ({
    publicDerivers: wallets.map(wallet => wallet.publicDeriver),
    getConceptualWalletSettingsCache: (conceptualWallet) => {
      for (const wallet of wallets) {
        if (wallet.publicDeriver.getParent() === conceptualWallet) {
          return wallet.conceptualWalletCache;
        }
      }
      throw new Error(`Missing cache entry for getConceptualWalletSettingsCache`);
    },
    getTransactions: (publicDeriver) => {
      for (const wallet of wallets) {
        if (wallet.publicDeriver === publicDeriver) {
          return wallet.getTransactions(publicDeriver);
        }
      }
      throw new Error(`Missing cache entry for transactions`);
    },
    getDelegation: (publicDeriver) => {
      for (const wallet of wallets) {
        if (wallet.publicDeriver === publicDeriver) {
          return wallet.getDelegation(publicDeriver);
        }
      }
      throw new Error(`Missing cache entry for delegation`);
    },
    getPublicKeyCache: (publicDeriver) => {
      for (const wallet of wallets) {
        if (wallet.publicDeriver === publicDeriver) {
          return wallet.getPublicKeyCache(publicDeriver);
        }
      }
      throw new Error(`Missing cache entry for publicKeyCache`);
    },
    getSigningKeyCache: (publicDeriver) => {
      for (const wallet of wallets) {
        if (wallet.publicDeriver === publicDeriver) {
          return wallet.getSigningKeyCache(publicDeriver);
        }
      }
      throw new Error(`Missing cache entry for getSigningKeyCache`);
    },
    getPublicDeriverSettingsCache: (publicDeriver) => {
      for (const wallet of wallets) {
        if (wallet.publicDeriver === publicDeriver) {
          return wallet.getPublicDeriverSettingsCache(publicDeriver);
        }
      }
      throw new Error(`Missing cache entry for getPublicDeriverSettingsCache`);
    },
    getTimeCalcRequests: (publicDeriver) => {
      for (const wallet of wallets) {
        if (wallet.publicDeriver === publicDeriver) {
          return wallet.getTimeCalcRequests(publicDeriver);
        }
      }
      throw new Error(`Missing cache entry for getTimeCalcRequests`);
    },
    getCurrentTimeRequests: (publicDeriver) => {
      for (const wallet of wallets) {
        if (wallet.publicDeriver === publicDeriver) {
          return wallet.getCurrentTimeRequests(publicDeriver);
        }
      }
      throw new Error(`Missing cache entry for getCurrentTimeRequests`);
    },
  });
}

export const genTentativeTx = () => {
  const inputAmount = '1000001';
  const ouputAmount = '400';
  const fee = new BigNumber(inputAmount).minus(new BigNumber(ouputAmount));

  if (environment.isShelley()) {
    const remoteUnspentUtxo = {
      amount: inputAmount,
      receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
      tx_index: 0,
      utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
    };
    const input = utxoToTxInput(remoteUnspentUtxo);
    const builder = RustModule.WalletV3.InputOutputBuilder.empty();
    builder.add_input(input);
    builder.add_output(
      RustModule.WalletV3.Address.from_string('addr1s33chdhaexquujgnwm458swlt4tl2t5qyyk7d04gtdy5utp4y6c9sf4nrtlu7glkdwww3leg94jr6rkt9prwfgfp7symp5nj08zuln4lmxjv7k'),
      RustModule.WalletV3.Value.from_str(ouputAmount)
    );
    const unsignedTx = builder.build();
    return {
      tentativeTx: {
        senderUtxos: [{
          ...remoteUnspentUtxo,
          addressing: {
            path: [],
            startLevel: 0,
          },
        }],
        unsignedTx,
        changeAddr: [],
        certificate: undefined,
      },
      inputAmount,
      fee,
    };
  }
  {
    const remoteUnspentUtxo = {
      amount: inputAmount,
      receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
      tx_index: 0,
      utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
    };
    const unsignedTx = RustModule.WalletV2.Transaction.from_json({
      inputs: [{
        id: remoteUnspentUtxo.tx_hash,
        index: remoteUnspentUtxo.tx_index
      }],
      outputs: [{
        address: 'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
        value: Number(ouputAmount)
      }]
    });
    return {
      tentativeTx: {
        senderUtxos: [{
          ...remoteUnspentUtxo,
          addressing: {
            path: [],
            startLevel: 0,
          },
        }],
        unsignedTx,
        changeAddr: [],
        certificate: undefined,
      },
      inputAmount,
      fee,
    };
  }
};

export const genUndelegateTx = () => {
  const inputAmount = '1000001';
  const ouputAmount = '400';
  const fee = new BigNumber(inputAmount).minus(new BigNumber(ouputAmount));

  if (!environment.isShelley()) {
    throw new Error('Delegation not supported for Byron');
  }
  const remoteUnspentUtxo = {
    amount: inputAmount,
    receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  };
  const input = utxoToTxInput(remoteUnspentUtxo);
  const builder = RustModule.WalletV3.InputOutputBuilder.empty();
  builder.add_input(input);
  const IOs = builder.build();
  return {
    senderUtxos: [{
      ...remoteUnspentUtxo,
      addressing: {
        path: [],
        startLevel: 0,
      },
    }],
    IOs,
    changeAddr: [],
    certificate: undefined, // TODO
  };
};
