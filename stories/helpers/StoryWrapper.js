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
import { yoroiPolymorphTheme } from '../../app/themes/PolymorphThemes';
import { themeOverrides } from '../../app/themes/overrides';
import { translations, LANGUAGES } from '../../app/i18n/translations';
import ThemeManager from '../../app/ThemeManager';
import { THEMES, changeToplevelTheme } from '../../app/themes';
import type { Theme } from '../../app/themes';
import environment from '../../app/environment';
import { getVarsForTheme } from '../../app/stores/toplevel/ProfileStore';

import { withKnobs, select, boolean } from '@storybook/addon-knobs';
import { addDecorator } from '@storybook/react';

import { PublicDeriver } from '../../app/api/ada/lib/storage/models/PublicDeriver';
import { ConceptualWallet } from '../../app/api/ada/lib/storage/models/ConceptualWallet';
import { Cip1852Wallet } from '../../app/api/ada/lib/storage/models/Cip1852Wallet/wrapper';
import { WalletTypeOption } from '../../app/api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { HasSign, HasLevels, GetSigningKey,  } from '../../app/api/ada/lib/storage/models/PublicDeriver/traits';


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
  Incorrect: string,
  Invalid: string,
  Correct: string,
|} {
  if (length === 21) {
    return {
      Empty: '',
      Partial: 'lamp',
      Incorrect: 'clown worth average equal giggle obtain lamp minimum brother replace define glimpse gaze tone mystery people crack wreck grow blanket current',
      Invalid: 'lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp lamp',
      Correct: 'slab spend fabric danger truly between delay like before sword prefer camera reject offer minor caught pitch shoe jewel wine lawn',
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

export function getDummyWallet(): PublicDeriver<> {
  const parent = (((new ConceptualWallet({
    db: (null: any),
    conceptualWalletId: 0,
    walletType: WalletTypeOption.WEB_WALLET,
    hardwareInfo: null,
  })): any): ConceptualWallet);
  const self = new PublicDeriver<>({
    publicDeriverId: 0,
    parent,
    pathToPublic: [],
    derivationId: 0,
  });
  return self;
}

export function getSigningWallet(): PublicDeriver<> {
  const parent = new Cip1852Wallet(
    (null: any),
    {
      db: (null: any),
      conceptualWalletId: 0,
      walletType: WalletTypeOption.WEB_WALLET,
      hardwareInfo: null,
    },
    {
      Cip1852WrapperId: 0,
      ConceptualWalletId: 0,
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
  const clazz = GetSigningKey(HasLevels(HasSign(PublicDeriver)));
  const self = new clazz({
    publicDeriverId: 0,
    parent,
    pathToPublic: [],
    derivationId: 0,
  });
  return self;
}
