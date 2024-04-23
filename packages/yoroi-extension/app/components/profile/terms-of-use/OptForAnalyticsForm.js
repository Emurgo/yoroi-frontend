// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './OptForAnalyticsForm.scss';
import { LoadingButton } from '@mui/lab';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ReactComponent as AnalyticsIllustration } from '../../../assets/images/analytics-illustration.inline.svg';
import { ReactComponent as YesIcon } from '../../../assets/images/yes.inline.svg';
import { ReactComponent as NoIcon } from '../../../assets/images/no.inline.svg';
import { Box, Typography } from '@mui/material';
import { RevampSwitch } from '../../widgets/Switch';

const messages = defineMessages({
  title: {
    id: 'profile.analytics.title',
    defaultMessage: '!!!Join the journey to improve Yoroi',
  },
  share: {
    id: 'profile.analytics.share',
    defaultMessage:
      '!!!Share user insights to help us fine tune Yoroi to better serve user preferences and needs.',
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
  onOpt: boolean => void,
  variant: 'startup' | 'settings',
  isOptedIn: boolean,
|};

type State = {|
  isSubmitting: boolean,
|};

@observer
export default class OptForAnalyticsForm extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = { isSubmitting: false };

  onOpt: boolean => void = isOptIn => {
    this.setState({ isSubmitting: true });
    this.props.onOpt(isOptIn);
  };

  render(): Node {
    const { intl } = this.context;
    const { variant, isOptedIn } = this.props;

    const isStartupScreen = variant === 'startup';
    const isSettingsScreen = variant === 'settings';

    const analyticsDetails = [
      [YesIcon, messages.line1],
      [YesIcon, messages.line2],
      [NoIcon, messages.line3],
      [NoIcon, messages.line4],
      [NoIcon, messages.line5],
    ];

    return (
      <Box mt={isStartupScreen ? '16px' : '0px'} className={styles.component}>
        <div className={variant === 'startup' ? styles.centeredBox : ''}>
          {isSettingsScreen && (
            <div className={styles.title}>{intl.formatMessage(messages.title)}</div>
          )}

          {isSettingsScreen ? (
            <Box my="24px">{intl.formatMessage(messages.share)}</Box>
          ) : (
            <div className={styles.illustration}>
              <AnalyticsIllustration />
            </div>
          )}

          {isStartupScreen && (
            <Typography component="div" variant="h5" fontWeight={500} mt="16px">
              {intl.formatMessage(messages.title)}
            </Typography>
          )}

          <Box my="16px">
            {analyticsDetails.map(([Icon, msg]) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px',
                }}
              >
                <Icon />
                <Typography component="div">
                  <FormattedHTMLMessage {...msg} />
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isStartupScreen ? 'center' : 'flex-start',
            }}
          >
            <a
              target="_blank"
              rel="noreferrer"
              href="https://emurgohelpdesk.zendesk.com/hc/en-us/articles/7594394140303-What-s-user-insights-"
              className={styles.learnMore}
            >
              {intl.formatMessage(messages.learnMore)}
            </a>
          </Box>

          {isSettingsScreen ? (
            <FormControlLabel
              label={intl.formatMessage(messages.allow)}
              control={
                <Box ml="8px">
                  <RevampSwitch
                    checked={isOptedIn}
                    onChange={event => this.onOpt(event.target.checked)}
                  />
                </Box>
              }
              labelPlacement="start"
              sx={{ marginLeft: '0px', marginTop: '40px' }}
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
      </Box>
    );
  }
}
