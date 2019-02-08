import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import GridFlexContainer from '../../components/layout/GridFlexContainer';
import FooterItem from '../../components/footer/FooterItem';
import { version } from '../../utils/logging';

import githubSvg from '../../assets/images/social/github.inline.svg';
import youtubeSvg from '../../assets/images/social/youtube.inline.svg';
import telegramSvg from '../../assets/images/social/telegram.inline.svg';
import twitterSvg from '../../assets/images/social/twitter.inline.svg';
import yoroiSvg from '../../assets/images/yoroi-logo-shape-white.inline.svg';

import buyTrezorSvg from '../../assets/images/footer/buy-trezor.inline.svg';

const messages = defineMessages({
  aboutYoroiVersion: {
    id: 'settings.general.aboutYoroi.version',
    defaultMessage: '!!!Yoroi version',
    description: 'Label for current Yoroi version.'
  },
  aboutYoroiWebsite: {
    id: 'settings.general.aboutYoroi.website',
    defaultMessage: '!!!Yoroi website',
    description: 'Label for Yoroi website link.'
  },
  aboutYoroiBlog: {
    id: 'settings.general.aboutYoroi.blog',
    defaultMessage: '!!!EMURGO blog',
    description: 'Label for EMURGO blog link.'
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
  aboutYoroiTelegramSupport: {
    id: 'settings.general.aboutYoroi.tgsupport',
    defaultMessage: '!!!Telegram community support',
    description: 'Label for Telegram Community Support group link.'
  },
});

export default class GeneralSettingsFooter extends Component {

  render() {
    return (
      <GridFlexContainer rowSize={3}>
        <FooterItem
          url="https://yoroi-wallet.com"
          svg={yoroiSvg}
          message={messages.aboutYoroiWebsite}
        />
        <FooterItem
          url="https://medium.com/@emurgo_io"
          svg={buyTrezorSvg}
          message={messages.aboutYoroiBlog}
        />
        <FooterItem
          url="https://twitter.com/YoroiWallet"
          svg={twitterSvg}
          message={messages.aboutYoroiTwitter}
        />
        <FooterItem
          url="https://github.com/Emurgo/yoroi-frontend"
          svg={githubSvg}
          message={messages.aboutYoroiGithub}
        />
        <FooterItem
          url="https://www.youtube.com/watch?v=GLNgpr-3t2E&list=PLFLTrdAG7xRZUmi04s44T1VEF20xKquF2"
          svg={youtubeSvg}
          message={messages.aboutYoroiYoutube}
        />
        <FooterItem
          url="https://t.me/CardanoCommunityTechSupport"
          svg={telegramSvg}
          message={messages.aboutYoroiTelegramSupport}
        />
        <FooterItem
          url={`https://github.com/Emurgo/yoroi-frontend/releases/tag/${version}`}
          svg={githubSvg}
          message={messages.aboutYoroiVersion}
        />
      </GridFlexContainer>
    );
  }

}
