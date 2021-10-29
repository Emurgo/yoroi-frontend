// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { LoadingButton } from '@mui/lab';
import { defineMessages, intlShape } from 'react-intl';
import CheckboxLabel from '../../common/CheckboxLabel';
import LocalizableError from '../../../i18n/LocalizableError';
import TermsOfUseText from './TermsOfUseText';
import PrivacyPolicy from './PrivacyPolicy';
import styles from './TermsOfUseForm.scss';
import CenteredBarDecoration from '../../widgets/CenteredBarDecoration';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  checkboxLabel: {
    id: 'profile.termsOfUse.checkboxLabel',
    defaultMessage: '!!!I agree with the terms of use',
  },
});

type Props = {|
  +localizedTermsOfUse: string,
  +onSubmit: void => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

type State = {|
  areTermsOfUseAccepted: boolean,
|};

@observer
export default class TermsOfUseForm extends Component<Props, State> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    areTermsOfUseAccepted: false,
  };

  toggleAcceptance() {
    this.setState(prevState => ({ areTermsOfUseAccepted: !prevState.areTermsOfUseAccepted }));
  }

  render(): Node {
    const { intl } = this.context;
    const { isSubmitting, error, localizedTermsOfUse } = this.props;
    const { areTermsOfUseAccepted } = this.state;

    const checkboxLabel = 'checkboxLabel';
    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>
          <PrivacyPolicy />
          <div className={styles.centerBar}>
            <CenteredBarDecoration />
          </div>
          <TermsOfUseText localizedTermsOfUse={localizedTermsOfUse} fixedHeight />

          <div className={styles.checkbox}>
            <CheckboxLabel
              label={intl.formatMessage(messages[checkboxLabel])}
              onChange={this.toggleAcceptance.bind(this)}
              checked={areTermsOfUseAccepted || this.props.isSubmitting}
            />

            <LoadingButton
              variant="primary"
              disabled={!areTermsOfUseAccepted}
              onClick={this.props.onSubmit}
              loading={isSubmitting}
              sx={{ width: '350px' }}
            >
              {intl.formatMessage(globalMessages.continue)}
            </LoadingButton>
          </div>

          {error && <p className={styles.error}>{intl.formatMessage(error, error.values)}</p>}
        </div>
      </div>
    );
  }
}
