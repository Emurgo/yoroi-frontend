// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { LoadingButton } from '@mui/lab';
import { MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import Select from '../../common/Select';
import { intlShape, FormattedHTMLMessage } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import type { LanguageType } from '../../../i18n/translations';
import styles from './LanguageSelectionForm.scss';
import FlagLabel from '../../widgets/FlagLabel';
import { tier1Languages } from '../../../config/languagesConfig';
import globalMessages, { listOfTranslators } from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ReactMarkdown from 'react-markdown';
import tosStyles from '../terms-of-use/TermsOfUseText.scss';

type Props = {|
  +onSelectLanguage: {| locale: string |} => void,
  +languages: Array<LanguageType>,
  +onSubmit: {| locale: string |} => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +currentLocale: string,
  +error?: ?LocalizableError,
  +localizedTermsOfUse: string,
  +localizedPrivacyNotice: string,
|};

type State = {|
  showing: 'form' | 'tos' | 'privacy',
|};

@observer
export default class LanguageSelectionForm extends Component<Props, State> {
  static defaultProps: {|error: void|} = {
    error: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  selectLanguage: string => void = (locale) => {
    this.props.onSelectLanguage({ locale });
  };

  submit: void => void = () => {
    this.form.submit({
      onSuccess: async (form) => {
        const { languageId } = form.values();
        await this.props.onSubmit({ locale: languageId });
      },
      onError: () => {}
    });
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      languageId: {
        label: this.context.intl.formatMessage(globalMessages.languageSelectLabel),
        value: this.props.currentLocale,
      },
      tosAgreement: {
        value: false,
      },
    }
  });

  state: State = { showing: 'form' };

  onClickTosLabel: (SyntheticEvent<HTMLElement>) => void  = (event) => {
    const target: Element = (event.target: any);

    if (target.tagName === 'A') {
      event.preventDefault();
    }
    if (target.id === 'tosLink') {
      this.setState({ showing: 'tos' });
    } else if (target.id === 'privacyLink') {
      this.setState({ showing: 'privacy' });
    }
  }

  onClickBack: () => void = () => {
    this.setState({ showing: 'form' });
  }

  renderForm(): Node {
    const { intl } = this.context;
    const { form } = this;
    const { languages, isSubmitting, currentLocale, error } = this.props;
    const languageId = form.$('languageId');
    const tosAgreement = form.$('tosAgreement');
    const languageOptions = languages.map(language => ({
      value: language.value,
      label: intl.formatMessage(language.label),
      svg: language.svg
    }));

    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>
          <Select
            formControlProps={{ sx: { marginBottom: '25px' } }}
            labelProps={{
              sx: {
                width: '100%',
                left: '0',
                top: '-55px',
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: '500',
                textTransform: 'uppercase',
              },
            }}
            labelId="languages-select"
            value={currentLocale}
            {...languageId.bind()}
            onChange={this.selectLanguage}
            notched={false}
            shrink={false}
          >
            {languageOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                <FlagLabel svg={option.svg} label={option.label} />
              </MenuItem>
            ))}
          </Select>

          {error && (
            <p className={styles.error}>
              {intl.formatMessage(error, error.values)}
            </p>
          )}

          <FormControlLabel
            onClick={this.onClickTosLabel}
            label={
              <span className={styles.tosAgreement}>
                <FormattedHTMLMessage {...globalMessages.tosAgreement} />
              </span>
            }
            control={
              <Checkbox
                checked={tosAgreement.value}
                onChange={event => { tosAgreement.value = event.target.checked; }}
              />
            }
            sx={{
              width: '600px',
              marginLeft: '0px',
              marginBottom: '20px',
            }}
          />

          <LoadingButton
            variant="primary"
            fullWidth
            loading={isSubmitting}
            onClick={this.submit}
            disabled={!tosAgreement.value}
          >
            {intl.formatMessage(globalMessages.continue)}
          </LoadingButton>

          {!tier1Languages.includes(currentLocale) &&
            <div className={styles.info}>
              <h1>{intl.formatMessage(globalMessages.languageSelectLabelInfo)}</h1>
              <p>
                {intl.formatMessage(globalMessages.languageSelectInfo)}
                {' '}
                {listOfTranslators(intl.formatMessage(globalMessages.translationContributors),
                  intl.formatMessage(globalMessages.translationAcknowledgment))}
              </p>
            </div>
          }

        </div>
      </div>
    );
  }

  renderMarkdown(markdown: string): Node {
    const { intl } = this.context;
    return (
      <>
        <div className={styles.component}>
          <div className={styles.tosBox}>
            <div className={tosStyles.terms}>
              <ReactMarkdown source={markdown} escapeHtml={false} />
            </div>
          </div>
        </div>
        <button type="button" className={styles.back} onClick={this.onClickBack}>
          &#129120;{intl.formatMessage(globalMessages.backButtonLabel)}
        </button>
      </>
    );
  }

  render(): Node {
    const { showing } = this.state;
    if (showing === 'form') {
      return this.renderForm();
    }
    if (showing === 'tos') {
      return this.renderMarkdown(this.props.localizedTermsOfUse);
    }
    return this.renderMarkdown(this.props.localizedPrivacyNotice);
  }
}
