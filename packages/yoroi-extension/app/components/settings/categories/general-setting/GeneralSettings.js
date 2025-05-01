// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import Select from '../../../common/Select';
import { Box, Typography } from '@mui/material';
import { defineMessages, IntlContext } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './GeneralSettings.scss';
import type { LanguageType } from '../../../../i18n/translations';
import FlagLabel from '../../../widgets/FlagLabel';
import { tier1Languages } from '../../../../config/languagesConfig';
import globalMessages, { listOfTranslators } from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { GlobalStyledScrollbar } from '../../../common/commonStyles/GlobalStylesScrollbar';
import { MenuItemStyled } from '../../../common/commonStyles/MenuItemStyled';

type Props = {|
  +languages: Array<LanguageType>,
  +currentLocale: string,
  +onSelectLanguage: ({| locale: string |}) => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

const messages = defineMessages({
  languageLabel: {
    id: 'wallet.settings.general.language',
    defaultMessage: '!!!Language',
  },
  languageSelectLabel: {
    id: 'wallet.settings.general.revamp.languageSelectLabel',
    defaultMessage: '!!!Select your language',
  },
});

@observer
export default class GeneralSettings extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextType:any = IntlContext;
  selectLanguage: string => Promise<void> = async locale => {
    await this.props.onSelectLanguage({ locale });
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      languageId: {
        label: this.context.intl.formatMessage(messages.languageSelectLabel),
        value: this.props.currentLocale,
      },
    },
  });

  render(): Node {
    const { languages, isSubmitting, error } = this.props;
    const intl = this.context;
    const { form } = this;
    const languageId = form.$('languageId');
    const languageOptions = languages.map(language => ({
      value: language.value,
      label: intl.formatMessage(language.label),
      svg: language.svg,
    }));
    const componentClassNames = classNames([styles.component, 'general']);
    const selectedLanguage = languageOptions.filter(item => item.value === this.props.currentLocale)[0];

    return (
      <div className={componentClassNames}>
        <Typography component="div" variant="body1" mb="16px" color="ds.text_gray_medium" fontWeight={500}>
          {intl.formatMessage(messages.languageLabel)}
        </Typography>
        <Box
          sx={{
            width: '506px',
          }}
        >
          <GlobalStyledScrollbar />
          <Select
            labelId="languages-select"
            {...languageId.bind()}
            onChange={this.selectLanguage}
            disabled={isSubmitting}
            renderValue={() => (
              <Typography component="div" variant="body1" color="ds.text_gray_medium">
                {selectedLanguage.label}
              </Typography>
            )}
          >
            {languageOptions.map(option => (
              <MenuItemStyled
                key={option.value}
                value={option.value}
                id={'selectLanguage-' + option.value + '-menuItem'}
              >
                <FlagLabel svg={option.svg} label={option.label} />
              </MenuItemStyled>
            ))}
          </Select>
          {error && <div className={styles.error}>{intl.formatMessage(error, error.values)}</div>}
        </Box>

        {!tier1Languages.includes(languageId.value) && (
          <Box component="div" className={styles.info}>
            <Typography variant="body2" color="ds.text_gray_medium" fontWeight={500}>
              {intl.formatMessage(globalMessages.languageSelectLabelInfo)}
            </Typography>
            <Typography variant="body2" color="ds.text_gray_medium">
              {intl.formatMessage(globalMessages.languageSelectInfo)}{' '}
              {listOfTranslators(
                intl.formatMessage(globalMessages.translationContributors),
                intl.formatMessage(globalMessages.translationAcknowledgment)
              )}
            </Typography>
          </Box>
        )}
      </div>
    );
  }
}
