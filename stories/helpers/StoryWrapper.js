// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
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
import nl from 'react-intl/locale-data/nl';
import pt from 'react-intl/locale-data/pt';
import id from 'react-intl/locale-data/id';
import es from 'react-intl/locale-data/es';
import it from 'react-intl/locale-data/it';
import tr from 'react-intl/locale-data/tr';
import '../../app/themes/index.global.scss';
import { yoroiPolymorphTheme } from '../../app/themes/PolymorphThemes';
import { themeOverrides } from '../../app/themes/overrides';
import { translations, LANGUAGES } from '../../app/i18n/translations';
import ThemeManager from '../../app/ThemeManager';
import { THEMES, changeToplevelTheme } from '../../app/themes';
import type { Theme } from '../../app/themes';
import environment from '../../app/environment';
import { getVarsForTheme } from '../../app/stores/toplevel/ProfileStore';

import { withKnobs, select, boolean } from '@storybook/addon-knobs';

import LocalizableError, { UnexpectedError } from '../../app/i18n/LocalizableError';
import globalMessages from '../../app/i18n/global-messages';
import { ledgerErrors } from '../../app/domain/LedgerLocalizedError';
import type { UnitOfAccountSettingType } from '../../app/types/unitOfAccountType';
import { IncorrectVersionError, IncorrectDeviceError } from '../../app/domain/ExternalDeviceCommon';
import { SimpleSkins } from 'react-polymorph/lib/skins/simple';
import { SimpleDefaults } from 'react-polymorph/lib/themes/simple';

import { addDecorator } from '@storybook/react';

/**
 * This whole file is meant to mirror code in App.js
 */

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([
  ...en,
  ...ko,
  ...ja,
  ...zh,
  ...ru,
  ...de,
  ...fr,
  ...nl,
  ...pt,
  ...id,
  ...es,
  ...it,
  ...tr,
]);

// TODO: should remove this as it's deprecated in Storybook v6
// but knobs-preset seems to have an issue in the alpha build
addDecorator(withKnobs);

const themeNames = Object.values(THEMES);

const langCode = LANGUAGES.map(item => item.value);

type Props = { +children: any, ... };

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
  environment.userAgentInfo.isFirefox = () => firefox;
  return firefox;
};

@observer
export default class StoryWrapper extends Component<Props> {

  render(): Node {
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
          skins={SimpleSkins}
          variables={SimpleDefaults}
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
  if (length === 24) {
    return {
      Empty: '',
      Partial: 'lamp',
      Invalid: 'lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp',
      Correct: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art',
    };
  }
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
  if (length === 24) {
    return {
      ...getMnemonicCases(24),
      Incorrect: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share',
    };
  }
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

export const trezorErrorCases: {|
  None: void,
  IFrameTimeout: LocalizableError,
  PermissionError: LocalizableError,
  Cancelled: LocalizableError,
|} = Object.freeze({
  None: undefined,
  IFrameTimeout: new LocalizableError(globalMessages.trezorError101),
  PermissionError: new LocalizableError(globalMessages.hwError101),
  Cancelled: new LocalizableError(globalMessages.trezorError103),
});

export const ledgerErrorCases: {|
  None: void,
  U2fTimeout: LocalizableError,
  OtherTimeout: LocalizableError,
  DeviceRejected: LocalizableError,
  UserRejected: LocalizableError,
  Locked: LocalizableError,
  NotAllowed: LocalizableError,
  Unexpected: LocalizableError,
  IncorrectSerial: LocalizableError,
  IncorrectVersion: LocalizableError,
|} = Object.freeze({
  None: undefined,
  U2fTimeout: new LocalizableError(globalMessages.ledgerError101),
  OtherTimeout: new LocalizableError(ledgerErrors.networkError105),
  DeviceRejected: new LocalizableError(ledgerErrors.cancelOnDeviceError101),
  UserRejected: new LocalizableError(ledgerErrors.cancelOnLedgerConnectError102),
  Locked: new LocalizableError(ledgerErrors.deviceLockedError103),
  NotAllowed: new LocalizableError(ledgerErrors.deviceLockedError104),
  Unexpected: new UnexpectedError(),
  IncorrectSerial: new IncorrectDeviceError({
    expectedDeviceId: '707fa118bf6b83',
    responseDeviceId: '118db063477019',
  }),
  IncorrectVersion: new IncorrectVersionError({
    supportedVersions: `2.0.4`,
    responseVersion: '2.0.3',
  }),
});

export const mockLedgerMeta = {
  DeviceId: '',
  Model: 'NanoS',
  Vendor: 'ledger.com',
};
export const mockTrezorMeta = {
  DeviceId: 'C875BA9D0C571FF4B8718FAA',
  Model: 'T',
  Vendor: 'trezor.io',
};

export const genUnitOfAccount: void => UnitOfAccountSettingType = () => {
  const unitOfAccountCases = {
    ADA: 0,
    USD: 1,
  };
  const unitOfAccount = select(
    'unitOfAccount',
    unitOfAccountCases,
    unitOfAccountCases.ADA
  );
  if (unitOfAccount === unitOfAccountCases.ADA) {
    return { enabled: false, currency: null };
  }
  return { enabled: true, currency: 'USD' };
};
