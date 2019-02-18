import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './AboutYoroiSettings.scss';
import { observer } from 'mobx-react';

import GridFlexContainer from '../../layout/GridFlexContainer';
import FooterItem from '../../footer/FooterItem';
import githubSvg from '../../../assets/images/social/github.inline.svg';
import youtubeSvg from '../../../assets/images/social/youtube.inline.svg';
import telegramSvg from '../../../assets/images/social/telegram.inline.svg';
import twitterSvg from '../../../assets/images/social/twitter.inline.svg';
import yoroiSvg from '../../../assets/images/yoroi-logo-shape-white.inline.svg';
import facebookSvg from '../../../assets/images/social/facebook.inline.svg';
import mediumSvg from '../../../assets/images/social/medium.inline.svg';

import environment from '../../../environment';

const version = require('../../../../chrome/manifest.' + environment.NETWORK + '.json').version;

const messages = defineMessages({
  aboutYoroiLabel: {
    id: 'settings.general.aboutYoroi.label',
    defaultMessage: '!!!About Yoroi',
    description: 'Label for the About Yoroi section.'
  },
  aboutYoroiWebsite: {
    id: 'settings.general.aboutYoroi.website',
    defaultMessage: '!!!Yoroi website',
    description: 'Label for Yoroi website link.'
  },
  aboutYoroiTwitter: {
    id: 'settings.general.aboutYoroi.twitter',
    defaultMessage: '!!!Yoroi Twitter',
    description: 'Label for Yoroi Twitter link.'
  },
  aboutYoroiGithub: {
    id: 'settings.general.aboutYoroi.github',
    defaultMessage: '!!!Yoroi GitHub',
    description: 'Label for Yoroi GitHub link.'
  },
  aboutYoroiYoutube: {
    id: 'settings.general.aboutYoroi.youtube',
    defaultMessage: '!!!EMURGO YouTube',
    description: 'Label for Yoroi YouTube link.'
  },
  aboutEmurgoTelegram: {
    id: 'settings.general.aboutYoroi.telegram',
    defaultMessage: '!!!EMURGO Telegram',
    description: 'Label for EMURGO Telegram link.'
  },
  aboutYoroiFacebook: {
    id: 'settings.general.aboutYoroi.facebook',
    defaultMessage: '!!!Yoroi facebook',
    description: 'Label for Yoroi facebook link.'
  },
  aboutYoroiMedium: {
    id: 'settings.general.aboutYoroi.medium',
    defaultMessage: '!!!EMURGO Medium',
    description: 'Label for EMURGO Medium link.'
  },
  versionLabel: {
    id: 'settings.general.aboutYoroi.versionLabel',
    defaultMessage: '!!!Current version:',
    description: 'Label for current version.'
  },
  networkLabel: {
    id: 'settings.general.aboutYoroi.networkLabel',
    defaultMessage: '!!!Network:',
    description: 'Label for network in use.'
  },
  commitLabel: {
    id: 'settings.general.aboutYoroi.commitLabel',
    defaultMessage: '!!!Commit:',
    description: 'Label for current commit.'
  },
});

@observer
export default class AboutYoroiSettings extends Component {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <h1>{intl.formatMessage(messages.aboutYoroiLabel)}</h1>

        <p>
          {intl.formatMessage(messages.versionLabel)}&nbsp;
          {version}
        </p>
        <p>
          {intl.formatMessage(messages.networkLabel)}&nbsp;
          {environment.NETWORK}
        </p>
        <p>
          {intl.formatMessage(messages.commitLabel)}&nbsp;
          {environment.commit}
        </p>
        <br />
        <GridFlexContainer rowSize={3}>
          <FooterItem
            url="https://twitter.com/YoroiWallet"
            svg={twitterSvg}
            message={messages.aboutYoroiTwitter}
          />
          <FooterItem
            className={styles.yoroiLogo}
            url="https://yoroi-wallet.com"
            svg={yoroiSvg}
            message={messages.aboutYoroiWebsite}
          />
          <FooterItem
            url="https://www.facebook.com/Yoroi-wallet-399386000586822/"
            svg={facebookSvg}
            message={messages.aboutYoroiFacebook}
          />
          <FooterItem
            url="https://www.youtube.com/channel/UCgFQ0hHuPO1QDcyP6t9KZTQ"
            svg={youtubeSvg}
            message={messages.aboutYoroiYoutube}
          />
          <FooterItem
            url="https://t.me/emurgo"
            svg={telegramSvg}
            message={messages.aboutEmurgoTelegram}
          />
          <FooterItem
            url="https://medium.com/@emurgo_io"
            svg={mediumSvg}
            message={messages.aboutYoroiMedium}
          />
          <FooterItem
            url="https://github.com/Emurgo/yoroi-frontend"
            svg={githubSvg}
            message={messages.aboutYoroiGithub}
          />
        </GridFlexContainer>
      </div>
    );
  }


}
