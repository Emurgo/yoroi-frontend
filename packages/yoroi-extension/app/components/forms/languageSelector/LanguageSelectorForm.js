// @flow
import { Component } from 'react';
import type { Node } from 'react';
import type { LanguageType } from '../../../i18n/translations';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { observer } from 'mobx-react';
import { Button, Checkbox, MenuItem, Typography } from '@mui/material';
import Select from '../../common/Select';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './LanguageSelectorForm.scss';
import FlagLabel from '../../widgets/FlagLabel';
import { tier1Languages } from '../../../config/languagesConfig';
import globalMessages, { listOfTranslators } from '../../../i18n/global-messages';
import { boolean } from '@storybook/addon-knobs';
import CheckboxLabel from '../../common/CheckboxLabel';
import { ReactComponent as OutlineIcon } from '../../../assets/images/forms/checkbox-outline-ds.inline.svg';
import { ReactComponent as CheckedIcon } from '../../../assets/images/forms/checkbox-checked-ds.inline.svg';

const messages: * = defineMessages({
  title: {
    id: 'form.languageSelector.title',
    defaultMessage: '!!!Select language',
  },
  label: {
    id: 'form.languageSelector.label',
    defaultMessage: '!!!Language',
  },
  checkboxLabel: {
    id: 'form.languageSelector.checkboxLabel',
    defaultMessage: '!!!I agree with <a href="{url}">Terms of Service Agreement</a>',
  },
  'en-US': {
    id: 'global.languages.us',
    defaultMessage: '!!!English',
  },
  'ja-JP': {
    id: 'global.languages.jp',
    defaultMessage: '!!!Japanese',
  },
  'ko-KR': {
    id: 'global.languages.kr',
    defaultMessage: '!!!KR',
  },
  'zh-Hans': {
    id: 'global.languages.hans',
    defaultMessage: '!!!Hans',
  },
  'zh-Hant': {
    id: 'global.languages.hant',
    defaultMessage: '!!!Hant',
  },
  'ru-RU': {
    id: 'global.languages.ru',
    defaultMessage: '!!!Russian',
  },
  'de-DE': {
    id: 'global.languages.de',
    defaultMessage: '!!!German',
  },
  'fr-FR': {
    id: 'global.languages.fr',
    defaultMessage: '!!!French',
  },
  'nl-NL': {
    id: 'global.languages.nl',
    defaultMessage: '!!!NL',
  },
  'pt-BR': {
    id: 'global.languages.br',
    defaultMessage: '!!!Portuguese',
  },
  'es-ES': {
    id: 'global.languages.es',
    defaultMessage: '!!!Spanish',
  },
  'it-IT': {
    id: 'global.languages.it',
    defaultMessage: '!!!Italian',
  },
  'id-ID': {
    id: 'global.languages.id',
    defaultMessage: '!!!ID',
  },
  'tr-TR': {
    id: 'global.languages.tr',
    defaultMessage: '!!!Turkish',
  },
  'cs-CZ': {
    id: 'global.languages.cz',
    defaultMessage: '!!!CZ',
  },
  'sk-SK': {
    id: 'global.languages.sk',
    defaultMessage: '!!!SK',
  },
});

type Props = {|
  +onSelectLanguage: ({| locale: string |}) => void,
  +languages: Array<LanguageType>,
  +onSubmit: ({| locale: string |}) => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +currentLocale: string,
  +error?: ?LocalizableError,
  +showTermsAndConditions?: boolean,
|};

type State = {|
  acceptedTermsAndConditions: boolean,
|};

@observer
export default class LanguageSelectorForm extends Component<Props, State> {
  static defaultProps: {| error: void, showTermsAndConditions: boolean |} = {
    error: undefined,
    showTermsAndConditions: true,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    acceptedTermsAndConditions: false,
  };

  selectLanguage: string => void = locale => {
    this.props.onSelectLanguage({ locale });
  };

  toggleAcceptTerms: void => void = () => {
    this.setState(prevState => ({
      acceptedTermsAndConditions: !prevState.acceptedTermsAndConditions,
    }));
  };

  submit: void => void = () => {
    this.form.submit({
      onSuccess: async form => {
        const { languageId } = form.values();
        await this.props.onSubmit({ locale: languageId });
      },
      onError: () => {},
    });
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      languageId: {
        label: this.context.intl.formatMessage(messages.label),
        value: this.props.currentLocale,
      },
      acceptedTermsAndConditions: {
        label: this.context.intl.formatMessage(messages.checkboxLabel, {
          url: '/terms-and-conditions',
        }),
        value: '',
      },
    },
  });

  render(): Node {
    const { intl } = this.context;
    const { form } = this;
    const { languages, isSubmitting, currentLocale, error } = this.props;
    const languageId = form.$('languageId');
    const acceptedTermsAndConditions = form.$('acceptedTermsAndConditions');
    const languageOptions = languages.map(language => ({
      value: language.value,
      label: intl.formatMessage(language.label),
      englishLabel: intl.formatMessage(messages[language.value]),
    }));

    return (
      <div className={styles.component}>
        <div className={styles.h1}>
          <Typography fontSize={16} fontWeight={500} color="var(--yoroi-palette-black)">
            {intl.formatMessage(messages.title)}
          </Typography>
        </div>
        <div className={styles.centeredBox}>
          <Select
            formControlProps={{ sx: { marginBottom: '4px' } }}
            labelId="language-selector"
            value={currentLocale}
            {...languageId.bind()}
            onChange={this.selectLanguage}
            sx={{
              '.MuiSelect-select .english-label': { display: 'none' },
              '.MuiSelect-select .original-label': { fontWeight: 400 },
            }}
            menuProps={{
              autoWidth: false,
              andchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }}
          >
            {languageOptions.map(option => (
              <MenuItem
                sx={{
                  height: '58px',
                  paddingY: '8px',
                  paddingX: '16px',
                }}
                key={option.value}
                value={option.value}
              >
                <div style={{ display: 'flex', flexFlow: 'column' }}>
                  <Typography variant="body-1" fontWeight={500} className="original-label">
                    {option.label}
                  </Typography>
                  <Typography
                    variant="body-3"
                    color="#242838" // TODO: use DS tokens
                    fontSize="12px"
                    className="english-label"
                  >
                    {option.englishLabel}
                  </Typography>
                </div>
              </MenuItem>
            ))}
          </Select>

          <CheckboxLabel
            sx={{ marginBottom: '24px' }}
            icon={<OutlineIcon />}
            checkedIcon={<CheckedIcon />}
            label={
              <span dangerouslySetInnerHTML={{ __html: acceptedTermsAndConditions.bind().label }} />
            }
            onChange={this.toggleAcceptTerms}
            checked={this.state.acceptedTermsAndConditions}
          />

          {error && <p className={styles.error}>{intl.formatMessage(error, error.values)}</p>}

          <div style={{ textAlign: 'center' }}>
            <Button
              disabled={!this.state.acceptedTermsAndConditions}
              variant="primary"
              onClick={this.submit}
            >
              {intl.formatMessage(globalMessages.continue)}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
