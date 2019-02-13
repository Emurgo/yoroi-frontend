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
            url="https://www.youtube.com/watch?v=GLNgpr-3t2E&list=PLFLTrdAG7xRZUmi04s44T1VEF20xKquF2"
            svg={youtubeSvg}
            message={messages.aboutYoroiYoutube}
          />
          <FooterItem
            url="https://t.me/emurgo"
            svg={telegramSvg}
            message={messages.aboutEmurgoTelegram}
          />
          <FooterItem
            url="https://www.facebook.com/Yoroi-wallet-399386000586822/"
            svg={facebookSvg}
            message={messages.aboutYoroiFacebook}
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
