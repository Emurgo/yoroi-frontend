// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { LoadingButton } from '@mui/lab';
import { Checkbox, FormControlLabel, } from '@mui/material';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './TermsOfUseForm.scss';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ReactMarkdown from 'react-markdown';
import tosStyles from './TermsOfUseText.scss';

const messages = defineMessages({
  updateTitle: {
    id: 'profile.termsOfUse.updateTitle',
    defaultMessage: '!!!Terms of Service Agreement and Privacy Notice update',
  },
  updateText: {
    id: 'profile.termsOfUse.updateText',
    defaultMessage: '!!!We have updated our Terms of Service Agreement and Privacy Policy to enhance your experience. Please review and accept them to keep enjoying Yoroi.',
  },
});

type Props = {|
  +localizedTermsOfUse: string,
  +onSubmit: void => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
  +localizedPrivacyNotice: string,
|};

type State = {|
  areTermsOfUseAccepted: boolean,
  showing: 'form' | 'tos' | 'privacy',
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
    showing: 'form',
  };

  toggleAcceptance() {
    this.setState(prevState => ({ areTermsOfUseAccepted: !prevState.areTermsOfUseAccepted }));
  }

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
    const { isSubmitting, error } = this.props;
    const { areTermsOfUseAccepted } = this.state;

    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>
          <div className={styles.title}>
            {intl.formatMessage(messages.updateTitle)}
          </div>
          <div className={styles.text}>
            {intl.formatMessage(messages.updateText)}
          </div>

          <div className={styles.agreement}>
            <FormControlLabel
              onClick={this.onClickTosLabel}
              label={
                <span className={styles.tosAgreement}>
                  <FormattedHTMLMessage {...globalMessages.tosAgreement} />
                </span>
              }
              control={
                <Checkbox
                  checked={areTermsOfUseAccepted}
                  onChange={this.toggleAcceptance.bind(this)}
                />
              }
              sx={{ margin: '0px' }}
            />
          </div>

          <div className={styles.submit}>
            <LoadingButton
              variant="primary"
              disabled={!areTermsOfUseAccepted}
              onClick={this.props.onSubmit}
              loading={isSubmitting}
              sx={{ width: '350px', margin: 'auto' }}
            >
              {intl.formatMessage(globalMessages.continue)}
            </LoadingButton>
          </div>

          {error && <p className={styles.error}>{intl.formatMessage(error, error.values)}</p>}
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
        <div className={styles.back}>
          <button type="button" onClick={this.onClickBack}>
            &#129120;{intl.formatMessage(globalMessages.backButtonLabel)}
          </button>
        </div>
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
