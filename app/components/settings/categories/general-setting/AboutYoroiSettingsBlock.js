// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './AboutYoroiSettingsBlock.scss';
import { observer } from 'mobx-react';

import GridFlexContainer from '../../../layout/GridFlexContainer';
import githubSvg from '../../../../assets/images/social/github.inline.svg';
import youtubeSvg from '../../../../assets/images/social/youtube.inline.svg';
import telegramSvg from '../../../../assets/images/social/telegram.inline.svg';
import twitterSvg from '../../../../assets/images/social/twitter.inline.svg';
import yoroiSvg from '../../../../assets/images/yoroi-logo-shape-white.inline.svg';
import facebookSvg from '../../../../assets/images/social/facebook.inline.svg';
import mediumSvg from '../../../../assets/images/social/medium.inline.svg';

import environment from '../../../../environment';
import LinkButton from '../../../widgets/LinkButton';
import RawHash from '../../../widgets/hashWrappers/RawHash';
import ExplorableHash from '../../../widgets/hashWrappers/ExplorableHash';
import { handleExternalLinkClick } from '../../../../utils/routing';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  aboutYoroiLabel: {
    id: 'settings.general.aboutYoroi.label',
    defaultMessage: '!!!About Yoroi',
  },
  aboutYoroiWebsite: {
    id: 'settings.general.aboutYoroi.website',
    defaultMessage: '!!!Yoroi website',
  },
  aboutYoroiTwitter: {
    id: 'settings.general.aboutYoroi.twitter',
    defaultMessage: '!!!Yoroi Twitter',
  },
  aboutYoroiGithub: {
    id: 'settings.general.aboutYoroi.github',
    defaultMessage: '!!!Yoroi GitHub',
  },
  aboutYoroiYoutube: {
    id: 'settings.general.aboutYoroi.youtube',
    defaultMessage: '!!!EMURGO YouTube',
  },
  aboutEmurgoTelegram: {
    id: 'settings.general.aboutYoroi.telegram',
    defaultMessage: '!!!EMURGO Telegram',
  },
  aboutYoroiFacebook: {
    id: 'settings.general.aboutYoroi.facebook',
    defaultMessage: '!!!Yoroi facebook',
  },
  aboutYoroiMedium: {
    id: 'settings.general.aboutYoroi.medium',
    defaultMessage: '!!!EMURGO Medium',
  },
  versionLabel: {
    id: 'settings.general.aboutYoroi.versionLabel',
    defaultMessage: '!!!Current version:',
  },
  networkLabel: {
    id: 'settings.general.aboutYoroi.networkLabel',
    defaultMessage: '!!!Network:',
  },
  commitLabel: {
    id: 'settings.general.aboutYoroi.commitLabel',
    defaultMessage: '!!!Commit:',
  },
  branchLabel: {
    id: 'settings.general.aboutYoroi.git.branch',
    defaultMessage: '!!!Branch:',
  },
});

const socialMediaLinks = [{
  url: 'https://twitter.com/YoroiWallet',
  svg: twitterSvg,
  message: messages.aboutYoroiTwitter
}, {
  svgClass: styles.yoroiLogo,
  url: 'https://yoroi-wallet.com',
  svg: yoroiSvg,
  message: messages.aboutYoroiWebsite
}, {
  url: 'https://www.facebook.com/Yoroi-wallet-399386000586822/',
  svg: facebookSvg,
  message: messages.aboutYoroiFacebook
}, {
  url: 'https://www.youtube.com/channel/UCgFQ0hHuPO1QDcyP6t9KZTQ',
  svg: youtubeSvg,
  message: messages.aboutYoroiYoutube
}, {
  url: 'https://t.me/emurgo',
  svg: telegramSvg,
  message: messages.aboutEmurgoTelegram
}, {
  url: 'https://medium.com/@emurgo_io',
  svg: mediumSvg,
  message: messages.aboutYoroiMedium
}, {
  url: 'https://github.com/Emurgo/yoroi-frontend',
  svg: githubSvg,
  message: messages.aboutYoroiGithub
}];

const baseGithubUrl = 'https://github.com/Emurgo/yoroi-frontend/';

@observer
export default class AboutYoroiSettingsBlock extends Component<{||}> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <h2>{intl.formatMessage(messages.aboutYoroiLabel)}</h2>

        <p className={styles.aboutLine}>
          <strong>{intl.formatMessage(messages.networkLabel)}</strong>&nbsp;
          {environment.NETWORK}
        </p>
        <div className={styles.aboutLine}>
          <strong>{intl.formatMessage(messages.versionLabel)}</strong>&nbsp;
          <ExplorableHash
            websiteName="Github"
            url={baseGithubUrl + 'releases/'}
            light={false}
            arrowRelativeToTip={false /* branch name may be too small otherwise */}
            onExternalLinkClick={handleExternalLinkClick}
          >
            <RawHash light={false}>
              {environment.version}
            </RawHash>
          </ExplorableHash>
        </div>
        <div className={styles.aboutLine}>
          <strong>{intl.formatMessage(messages.commitLabel)}</strong>&nbsp;
          <ExplorableHash
            websiteName="Github"
            url={baseGithubUrl + 'commit/' + environment.commit}
            light={false}
            onExternalLinkClick={handleExternalLinkClick}
          >
            <RawHash light={false}>
              {environment.commit}
            </RawHash>
          </ExplorableHash>
        </div>
        {!environment.isProduction() &&
          <div className={styles.aboutLine}>
            <strong>{intl.formatMessage(messages.branchLabel)}</strong>&nbsp;
            <ExplorableHash
              websiteName="Github"
              url={baseGithubUrl + 'tree/' + environment.branch}
              light={false}
              arrowRelativeToTip={false /* branch name may be too small otherwise */}
              onExternalLinkClick={handleExternalLinkClick}
            >
              <RawHash light={false}>
                {environment.branch}
              </RawHash>
            </ExplorableHash>
          </div>
        }
        <div className={styles.aboutSocial}>
          <GridFlexContainer rowSize={socialMediaLinks.length}>
            {socialMediaLinks.map(link => (
              <LinkButton
                key={link.url}
                {...link}
                textClassName={styles.socialMediaLinkText}
                onExternalLinkClick={handleExternalLinkClick}
              />
            ))}
          </GridFlexContainer>
        </div>
      </div>
    );
  }


}
