// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresProps } from '../../stores';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { Box, Button } from '@mui/material';
import { ReactComponent as BackIcon } from '../../assets/images/assets-page/backarrow.inline.svg';
import ReactMarkdown from 'react-markdown';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import environment from '../../environment';
import OptForAnalyticsForm from '../../components/profile/terms-of-use/OptForAnalyticsForm';
import tosStyles from '../../components/profile/terms-of-use/TermsOfUseText.scss'
import globalMessages from '../../i18n/global-messages';

@observer
export default class OptForAnalyticsPage extends Component<StoresProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state = {
    showPrivacyNotice: false
  }

  togglePrivacyNotice: () => void = () => {
    console.log("toggle")
    this.setState(prevState => ({ showPrivacyNotice: !prevState.showPrivacyNotice }));
  };

  renderPrivacyNotice(markdown: string): Node {
    const { intl } = this.context;
    const privacyNotice = this.props.stores.profile.privacyNotice;
    return (
      <>
        <Box mt="48px" maxWidth="648px" mx="auto" pb="20px">
          <Box width="648px">
            <div className={tosStyles.terms}>
              <ReactMarkdown source={privacyNotice} escapeHtml={false} />
            </div>
          </Box>
        </Box>
        <Button
          sx={{
            color: 'grayscale.900',
            position: 'absolute',
            top: '24px',
            left: '24px',
          }}
          startIcon={<BackIcon />}
          onClick={this.togglePrivacyNotice}
        >
          {intl.formatMessage(globalMessages.backButtonLabel)}
        </Button>
      </>
    );
  }


  render(): Node {

    return (
      <Box height="100vh" paddingBottom="24px" sx={{ overflowY: 'auto' }}>
        <IntroBanner isNightly={environment.isNightly()} />
        {this.state.showPrivacyNotice ?
          this.renderPrivacyNotice()
          :
          <OptForAnalyticsForm
            onOpt={this.props.stores.profile.onOptForAnalytics}
            variant="startup"
            isOptedIn={false}
            onPrivacyNoticeClick={this.togglePrivacyNotice}
          />
        }
      </Box>
    );
  }
}
