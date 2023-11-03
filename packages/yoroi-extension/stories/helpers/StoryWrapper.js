// @flow

import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { IntlProvider } from 'react-intl';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { observable, autorun, runInAction } from 'mobx';
import { globalStyles } from '../../app/styles/globalStyles';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';
import { translations, LANGUAGES } from '../../app/i18n/translations';
import { THEMES, changeToplevelTheme, MuiThemes } from '../../app/styles/utils';
import type { Theme } from '../../app/styles/utils';
import environment from '../../app/environment';

import { withKnobs, select, boolean } from '@storybook/addon-knobs';

import LocalizableError, { UnexpectedError } from '../../app/i18n/LocalizableError';
import globalMessages from '../../app/i18n/global-messages';
import { ledgerErrors } from '../../app/domain/LedgerLocalizedError';
import type { UnitOfAccountSettingType } from '../../app/types/unitOfAccountType';
import { IncorrectVersionError, IncorrectDeviceError } from '../../app/domain/ExternalDeviceCommon';
import { addDecorator } from '@storybook/react';
import { LayoutProvider } from '../../app/styles/context/layout';

/**
 * This whole file is meant to mirror code in App.js
 */

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
  @observable mergedMessages: null | {| [key: string]: string, |} = null;

  componentDidMount: () => void = () => {
    autorun(async () => {
      const _mergedMessages = Object.assign(
        {},
        await translations['en-US'],
        await translations[globalKnobs.locale()]
      );
      runInAction(() => {
        this.mergedMessages = _mergedMessages;
      });
    });
  }

  render(): Node {
    const mergedMessages = this.mergedMessages;
    if (mergedMessages === null) {
      return null;
    }
    const { children: Story } = this.props;
    const locale = globalKnobs.locale();
    const currentTheme = globalKnobs.currentTheme();

    changeToplevelTheme(currentTheme);
    const muiTheme = MuiThemes[currentTheme];

    /* Emotion theme provider is used to ensure that the theme gets picked up correctly.
    Issue: https://github.com/mui-org/material-ui/issues/24282#issuecomment-859393395 */
    return (
      <div style={{ height: 'calc(100vh)' }}>
        <LayoutProvider>
          <EmotionThemeProvider theme={muiTheme}>
            <ThemeProvider theme={muiTheme}>
              <CssBaseline />
              {globalStyles(muiTheme)}
              {/* Automatically pass a theme prop to all components in this subtree. */}
              <IntlProvider
                {...{
                  locale,
                  key: locale,
                  messages: mergedMessages,
                }}
              >
                <Story />
              </IntlProvider>
            </ThemeProvider>
          </EmotionThemeProvider>
        </LayoutProvider>
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
