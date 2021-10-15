// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { LoadingButton } from '@mui/lab';
import { MenuItem } from '@mui/material';
import Select from '../../common/Select';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import type { LanguageType } from '../../../i18n/translations';
import styles from './LanguageSelectionForm.scss';
import FlagLabel from '../../widgets/FlagLabel';
import { tier1Languages } from '../../../config/languagesConfig';
import globalMessages, { listOfTranslators } from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +onSelectLanguage: {| locale: string |} => void,
  +languages: Array<LanguageType>,
  +onSubmit: {| locale: string |} => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +currentLocale: string,
  +error?: ?LocalizableError,
|};

@observer
export default class LanguageSelectionForm extends Component<Props> {
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
      }
    }
  });

  render(): Node {
    const { intl } = this.context;
    const { form } = this;
    const { languages, isSubmitting, currentLocale, error } = this.props;
    const languageId = form.$('languageId');
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
            labelSx={{
              width: '100%',
              left: '0',
              top: '-55px',
              textAlign: 'center',
              fontSize: '1rem',
              fontWeight: '500',
              textTransform: 'uppercase',
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

          <LoadingButton
            variant="primary"
            fullWidth
            loading={isSubmitting}
            onClick={this.submit}
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
}
