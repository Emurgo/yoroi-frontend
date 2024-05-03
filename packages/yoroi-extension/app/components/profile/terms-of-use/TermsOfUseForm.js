// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './TermsOfUseForm.scss';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ReactMarkdown from 'react-markdown';
import tosStyles from './TermsOfUseText.scss';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';
import { ReactComponent as BackIcon } from '../../../assets/images/assets-page/backarrow.inline.svg';

const messages = defineMessages({
  updateTitle: {
    id: 'profile.termsOfUse.updateTitle',
    defaultMessage: '!!!Terms of Service Agreement and Privacy Notice update',
  },
  updateText: {
    id: 'profile.termsOfUse.updateText',
    defaultMessage:
      '!!!We have updated our Terms of Service Agreement and Privacy Policy to enhance your experience. Please review and accept them to keep enjoying Yoroi.',
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
class TermsOfUseForm extends Component<Props & InjectedLayoutProps, State> {
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

  onClickTosLabel: (SyntheticEvent<HTMLElement>) => void = event => {
    const target: Element = (event.target: any);

    if (target.tagName === 'A') {
      event.preventDefault();
    }
    if (target.id === 'tosLink') {
      this.setState({ showing: 'tos' });
    } else if (target.id === 'privacyLink') {
      this.setState({ showing: 'privacy' });
    }
  };

  onClickBack: () => void = () => {
    this.setState({ showing: 'form' });
  };

  renderForm(): Node {
    const { intl } = this.context;
    const { isSubmitting, error, renderLayoutComponent } = this.props;
    const { areTermsOfUseAccepted } = this.state;

    const classicLayout = (
      <div className={styles.component}>
        <div className={styles.centeredBox}>
          <div className={styles.title}>{intl.formatMessage(messages.updateTitle)}</div>
          <div className={styles.text}>{intl.formatMessage(messages.updateText)}</div>

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

          {error && <div className={styles.error}>{intl.formatMessage(error, error.values)}</div>}
        </div>
      </div>
    );

    const revampLayout = (
      <Box mt="48px">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '536px',
            textAlign: 'center',
            gap: '24px',
            mx: 'auto',
          }}
        >
          <Typography component="div" variant="h5" fontWeight={500} maxWidth="350px">
            {intl.formatMessage(messages.updateTitle)}
          </Typography>
          <Typography component="div" variant="body1" maxWidth="450px">
            {intl.formatMessage(messages.updateText)}
          </Typography>

          <div className={styles.agreement}>
            <FormControlLabel
              onClick={this.onClickTosLabel}
              label={
                <Box
                  sx={{
                    '& span > span': {
                      color: 'ds.primary_c600',
                    },
                  }}
                >
                  <FormattedHTMLMessage {...globalMessages.tosAgreement} />
                </Box>
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

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LoadingButton
              variant="primary"
              disabled={!areTermsOfUseAccepted}
              onClick={this.props.onSubmit}
              loading={isSubmitting}
              sx={{
                width: 'fit-content',
                '&.MuiButton-sizeMedium': {
                  padding: '13px 24px',
                },
              }}
            >
              {intl.formatMessage(globalMessages.continue)}
            </LoadingButton>
          </Box>

          {error && <div className={styles.error}>{intl.formatMessage(error, error.values)}</div>}
        </Box>
      </Box>
    );

    return renderLayoutComponent({
      CLASSIC: classicLayout,
      REVAMP: revampLayout,
    });
  }

  renderMarkdown(markdown: string): Node {
    const { intl } = this.context;
    const { renderLayoutComponent } = this.props;

    const classicLayout = (
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
    const revampLayout = (
      <>
        <Box mt="48px" maxWidth="648px" mx="auto" pb="20px">
          <div className={styles.tosBox}>
            <div className={tosStyles.terms}>
              <ReactMarkdown source={markdown} escapeHtml={false} />
            </div>
          </div>
        </Box>
        <Button
          sx={{
            color: 'ds.gray_c900',
            position: 'absolute',
            top: '24px',
            left: '24px',
          }}
          startIcon={<BackIcon />}
          onClick={this.onClickBack}
        >
          {intl.formatMessage(globalMessages.backButtonLabel)}
        </Button>
      </>
    );
    return renderLayoutComponent({
      CLASSIC: classicLayout,
      REVAMP: revampLayout,
    });
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

export default (withLayout(TermsOfUseForm): ComponentType<Props>);
