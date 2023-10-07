// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './OptForAnalyticsForm.scss';
import { LoadingButton } from '@mui/lab';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  ReactComponent as AnalyticsIllustration
}  from '../../../assets/images/analytics-illustration.inline.svg';

const messages = defineMessages({
  title: {
    id: 'profile.analytics.title',
    defaultMessage: '!!!Join the journey to improve Yoroi',
  },
  share: {
    id: 'profile.analytics.share',
    defaultMessage: '!!!Share user insights to help us fine tune Yoroi to better serve user preferences and needs.',
  },
  line1: {
    id: 'profile.analytics.line1',
    defaultMessage: '!!!Anonymous analytics data',
  },
  line2: {
    id: 'profile.analytics.line2',
    defaultMessage: '!!!You can always opt-out via Settings',
  },
  line3: {
    id: 'profile.analytics.line3',
    defaultMessage: '!!!We <strong>can not</strong> access private keys',
  },
  line4: {
    id: 'profile.analytics.line4',
    defaultMessage: '!!!We <strong>are not</strong> recording IP addresses',
  },
  line5: {
    id: 'profile.analytics.line5',
    defaultMessage: '!!!We <strong>do not</strong> sell data',
  },
  learnMore: {
    id: 'profile.analytics.learnMore',
    defaultMessage: '!!!Learn more about user insights',
  },
  accept: {
    id: 'profile.analytics.accept',
    defaultMessage: '!!!Accept',
  },
  allow: {
    id: 'profile.analytics.allow',
    defaultMessage: '!!!Allow Yoroi analytics',
  },
});

type Props = {|
  onOpt: (boolean) => void,
  variant: 'startup' | 'settings',
  isOptedIn: boolean,
|};

type State = {|
  isSubmitting: boolean,
|};

@observer
export default class OptForAnalyticsForm extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = { isSubmitting: false };

  onOpt: (boolean) => void = (isOptIn) => {
    this.setState({ isSubmitting: true });
    this.props.onOpt(isOptIn);
  }

  render(): Node {
    const { intl } = this.context;
    const { variant, isOptedIn } = this.props;

    return (
      <div className={styles.component}>
        <div className={variant === 'startup' ? styles.centeredBox : ''}>
          <div className={styles.title}>{intl.formatMessage(messages.title)}</div>
          {variant === 'settings' ? (
            <div className={styles.share}>{intl.formatMessage(messages.share)}</div>
          ): (
            <div className={styles.illustration}>
              <AnalyticsIllustration />
            </div>
          )}
          <ul>
            <li className={styles.yes}>{intl.formatMessage(messages.line1)}</li>
            <li className={styles.yes}>{intl.formatMessage(messages.line2)}</li>
            <li className={styles.no}><FormattedHTMLMessage {...messages.line3} /></li>
            <li className={styles.no}><FormattedHTMLMessage {...messages.line4} /></li>
            <li className={styles.no}><FormattedHTMLMessage {...messages.line5} /></li>
          </ul>
          <div>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://emurgohelpdesk.zendesk.com/hc/en-us/articles/7594394140303-What-s-user-insights-"
              className={styles.learnMore}
            >
              {intl.formatMessage(messages.learnMore)}
            </a>
          </div>

          {variant === 'settings' ? (
            <FormControlLabel
              label={intl.formatMessage(messages.allow)}
              control={
                <Switch
                  checked={isOptedIn}
                  onChange={event => this.onOpt(event.target.checked)}
                />
              }
              labelPlacement="start"
              sx={{ marginLeft: '0px', marginTop: '16px' }}
            />
          ) : (
            <>
              <div className={styles.skip}>
                <button type="button" onClick={() => this.onOpt(false)}>
                  {intl.formatMessage(globalMessages.skipLabel)}
                </button>
              </div>
              <div className={styles.accept}>
                <LoadingButton
                  variant="primary"
                  onClick={() => this.onOpt(true)}
                  loading={this.state.isSubmitting}
                >
                  {intl.formatMessage(messages.accept)}
                </LoadingButton>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}

