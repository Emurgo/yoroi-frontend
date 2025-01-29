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
import { Box, Button, Link, Typography } from '@mui/material';
import { RevampSwitch } from '../../widgets/Switch';
import environment from '../../../environment';

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
    defaultMessage: '!!!Provide anonymous analytics about visited extension pages, browser version, selected language, time of analytical events',
  },
  line2: {
    id: 'profile.analytics.line2',
    defaultMessage: '!!!You can always opt-out via Settings and it won’t impact your experience',
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
  privacyNotice: {
    id: 'profile.analytics.seePrivacyNotice',
    defaultMessage: '!!!See Privacy Notice',
  },
  collectedData: {
    id: 'profile.analytics.collectedData',
    defaultMessage: '!!!Collected data includes: visited Yoroi extension pages, browser version, selected language, time of analytical events',
  },
  rejectionImpact: {
    id: 'profile.analytics.rejectionImpact',
    defaultMessage: '!!!Opting out won’t impact your experience',
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
        onPrivacyNoticeClick: () => void
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
    const { variant, isOptedIn, onPrivacyNoticeClick } = this.props;

    const isStartupScreen = variant === 'startup';
    const isSettingsScreen = variant === 'settings';

    const isFirefox = environment.isFirefox();

    const analyticsDetails = [
      [YesIcon, messages.line1],
      [YesIcon, messages.line2],
      [NoIcon, messages.line3],
      [NoIcon, messages.line4],
      [NoIcon, messages.line5],
    ].filter(Boolean);

    return (
      <>
        <Box mt={isStartupScreen ? '16px' : '0px'} className={styles.component}>
          <div className={variant === 'startup' ? styles.centeredBox : ''}>
            {isSettingsScreen && (
              <Typography variant="h5" color="ds.text_gray_medium" fontWeight={500}>
                {intl.formatMessage(messages.title)}
              </Typography>
            )}

            {isSettingsScreen ? (
              <Box my="24px" color="ds.text_gray_medium">{intl.formatMessage(messages.share)}</Box>
            ) : (
              <div className={styles.illustration}>
                <AnalyticsIllustration />
              </div>
            )}

            {isStartupScreen && (
              <Typography component="div" variant="h5" textAlign="center" fontWeight={500} mt="16px">
                {intl.formatMessage(messages.title)}
              </Typography>
            )}

            <Box my="16px">
              {analyticsDetails.map(([Icon, msg]) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    width: isStartupScreen ? "496px" : undefined
                  }}
                >
                  <Box sx={{ flexShrink: 0, mt: "3px" }}>
                    <Icon />
                  </Box>
                  <Typography component="div" color="ds.text_gray_medium">
                    <FormattedHTMLMessage {...msg} />
                  </Typography>
                </Box>
              ))}
            </Box>

          </div>
        </Box>

        <Box className={styles.component}>
          <div className={variant === 'startup' ? styles.centeredBox : ''}>

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
                sx={{
                  marginLeft: '0px',
                  marginTop: '40px',
                  color: 'ds.text_gray_medium',
                }}
              />
            ) : (
              <Box sx={{
                display: "flex",
                gap: "16px",
                width: "343px",
                my: "32px"
              }}>
                <Button sx={{ width: "163px" }} variant='secondary' size='medium' onClick={() => this.onOpt(false)} id="startupAnalytics-skip-button">
                  {intl.formatMessage(globalMessages.refuseLabel)}
                </Button>
                <LoadingButton
                  sx={{ width: "163px" }}
                  variant="primary"
                  size='medium'
                  onClick={() => this.onOpt(true)}
                  loading={this.state.isSubmitting}
                  id="startupAnalytics-accept-button"
                >
                  {intl.formatMessage(messages.accept)}
                </LoadingButton>
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isStartupScreen ? 'center' : 'flex-start',
              }}
            >
              {isFirefox ? <Link
                sx={{ '&:hover': { cursor: "pointer" } }}
                target="_blank"
                rel="noreferrer"
                href={environment.externalPrivacyPolicyURL()}
              >
                {intl.formatMessage(messages.privacyNotice)}
              </Link> : <Link sx={{ '&:hover': { cursor: "pointer" } }} onClick={onPrivacyNoticeClick}>
                {intl.formatMessage(messages.privacyNotice)}
              </Link>
              }
            </Box>
          </div>
        </Box>
      </>
    );
  }
}
