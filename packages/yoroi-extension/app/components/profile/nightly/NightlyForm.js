// @flow
import { Component } from 'react';
import type { ComponentType, Node } from 'react';
import { observer } from 'mobx-react';
import { Box, Button, Typography } from '@mui/material';
import CheckboxLabel from '../../common/CheckboxLabel';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import styles from './NightlyForm.scss';
import globalMessages from '../../../i18n/global-messages';
import { ReactComponent as NightlyIcon } from '../../../assets/images/yoroi-nightly-icon.inline.svg';
import { ReactComponent as NightlyIconRevamp } from '../../../assets/images/yoroi-nightly-icon-dark.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';

const messages = defineMessages({
  nightlySlogan: {
    id: 'profile.nighly.slogan',
    defaultMessage: '!!!Testnet wallet for Cardano assets',
  },
  header: {
    id: 'profile.nightly.header',
    defaultMessage:
      '!!!Yoroi Nightly automatically updates nightly with the latest in-progress features. Although we will never intentionally push bugs or broken code, features may still be in-progress or contain errors.',
  },
  warningHeader: {
    id: 'profile.nightly.warningHeader',
    defaultMessage: '!!!In order to simulate a production environment:',
  },
  warning1: {
    id: 'profile.nightly.warning1',
    defaultMessage: '!!!Yoroi Nightly does NOT operate on a mock blockchain or test server.',
  },
  warning2: {
    id: 'profile.nightly.warning2',
    defaultMessage:
      '!!!Any transactions you send will be visible on-chain and in production servers.',
  },
  recommendationHeader: {
    id: 'profile.nightly.recommendationHeader',
    defaultMessage: '!!!We recommend that:',
  },
  recommendation1: {
    id: 'profile.nightly.recommendation1',
    defaultMessage: '!!!You only use wallets with a small balance to minimize risk.',
  },
  recommendation2: {
    id: 'profile.nightly.recommendation2',
    defaultMessage: '!!!You report any issues to EMURGO through the Yoroi Nightly channel.',
  },
  acknowledgedRisks: {
    id: 'profile.nightly.acknowledgedRisks',
    defaultMessage: '!!!I understand the risk',
  },
});

type Props = {|
  +onSubmit: void => PossiblyAsync<void>,
|};

type State = {|
  acknowledgedRisks: boolean,
|};

@observer
class NightlyForm extends Component<Props & InjectedLayoutProps, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    acknowledgedRisks: false,
  };

  toggleAcceptance(): void {
    this.setState(prevState => ({ acknowledgedRisks: !prevState.acknowledgedRisks }));
  }

  render(): Node {
    const { intl } = this.context;
    const { onSubmit, isRevampLayout, renderLayoutComponent } = this.props;

    const classicLayout = (
      <div className={styles.component}>
        <div className={styles.centeredBox}>
          <div className={styles.logo}>
            <NightlyIcon />
          </div>
          <div className={styles.content}>
            <FormattedHTMLMessage {...messages.header} />
            <br />
            <br />
            <div className={styles.header}>{intl.formatMessage(messages.warningHeader)}</div>
            <ul>
              <li>{intl.formatMessage(messages.warning1)}</li>
              <li>{intl.formatMessage(messages.warning2)}</li>
            </ul>
            <br />
            <div className={styles.header}>{intl.formatMessage(messages.recommendationHeader)}</div>
            <ul>
              <li>{intl.formatMessage(messages.recommendation1)}</li>
              <li>{intl.formatMessage(messages.recommendation2)}</li>
            </ul>
          </div>
          <div className={styles.checkbox}>
            <CheckboxLabel
              label={intl.formatMessage(messages.acknowledgedRisks)}
              onChange={this.toggleAcceptance.bind(this)}
              checked={this.state.acknowledgedRisks}
            />
          </div>
          <Button
            variant={isRevampLayout ? 'contained' : 'primary'}
            onClick={onSubmit}
            disabled={!this.state.acknowledgedRisks}
            sx={{ width: '480px' }}
          >
            {intl.formatMessage(globalMessages.continue)}
          </Button>
        </div>
      </div>
    );

    const revampLayout = (
      <Box>
        <Box maxWidth="424px" mx="auto">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: '24px',
            }}
          >
            <NightlyIconRevamp />
            <Typography component="div" variant="h1" fontWeight={500} mb="8px" mt="24px" lineHeight="24px">
              {intl.formatMessage(globalMessages.yoroiNightly)}
            </Typography>
            <Typography component="div" variant="body1" fontWeight={500} lineHeight="24px">
              {intl.formatMessage(messages.nightlySlogan)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
            }}
          >
            <Typography component="div" variant="body1" lineHeight="24px">
              <FormattedHTMLMessage {...messages.header} />
            </Typography>

            <Box>
              <Typography component="div" variant="body1" lineHeight="24px">
                {intl.formatMessage(messages.warningHeader)}
              </Typography>
              <Box
                component="ul"
                sx={{
                  listStyle: 'inside',
                  pl: '4px',
                }}
              >
                <Typography component="li" variant="body1" lineHeight="24px">
                  {intl.formatMessage(messages.warning1)}
                </Typography>
                <Typography component="li" variant="body1" lineHeight="24px">
                  {intl.formatMessage(messages.warning2)}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography component="div" variant="body1" lineHeight="24px">
                {intl.formatMessage(messages.recommendationHeader)}
              </Typography>
              <Box
                component="ul"
                sx={{
                  listStyle: 'inside',
                  pl: '4px',
                }}
              >
                <Typography component="li" variant="body1" lineHeight="24px">
                  {intl.formatMessage(messages.recommendation1)}
                </Typography>
                <Typography component="li" variant="body1" lineHeight="24px">
                  {intl.formatMessage(messages.recommendation2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box my="24px">
            <CheckboxLabel
              label={intl.formatMessage(messages.acknowledgedRisks)}
              onChange={this.toggleAcceptance.bind(this)}
              checked={this.state.acknowledgedRisks}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="primary"
              onClick={onSubmit}
              disabled={!this.state.acknowledgedRisks}
              sx={{
                width: 'fit-content',
                lineHeight: '22px',
                '&.MuiButton-sizeMedium': {
                  padding: '13px 24px',
                },
              }}
            >
              {intl.formatMessage(globalMessages.continue)}
            </Button>
          </Box>
        </Box>
      </Box>
    );

    return renderLayoutComponent({
      CLASSIC: classicLayout,
      REVAMP: revampLayout,
    });
  }
}

export default (withLayout(NightlyForm): ComponentType<Props>);
