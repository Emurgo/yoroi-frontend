// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './AboutYoroiSettingsBlock.scss';
import { observer } from 'mobx-react';

import GridFlexContainer from '../../../layout/GridFlexContainer';
import { ReactComponent as githubSvg } from '../../../../assets/images/social/github.inline.svg';
import { ReactComponent as youtubeSvg } from '../../../../assets/images/social/youtube.inline.svg';
import { ReactComponent as telegramSvg } from '../../../../assets/images/social/telegram.inline.svg';
import { ReactComponent as twitterSvg } from '../../../../assets/images/social/twitter.inline.svg';
import { ReactComponent as yoroiSvg } from '../../../../assets/images/yoroi-logo-shape-white.inline.svg';
import { ReactComponent as facebookSvg } from '../../../../assets/images/social/facebook.inline.svg';
import { ReactComponent as mediumSvg } from '../../../../assets/images/social/medium.inline.svg';

import environment from '../../../../environment';
import LinkButton from '../../../widgets/LinkButton';
import { isTestnet } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import RawHash from '../../../widgets/hashWrappers/RawHash';
import ExplorableHash from '../../../widgets/hashWrappers/ExplorableHash';
import { handleExternalLinkClick } from '../../../../utils/routing';
import { PublicDeriver } from '../../../../api/ada/lib/storage/models/PublicDeriver';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, Link, Typography } from '@mui/material';
import { withLayout } from '../../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../../styles/context/layout';

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
  mainnet: {
    id: 'settings.general.aboutYoroi.network.mainnet',
    defaultMessage: '!!!Mainnet Network',
  },
  testnet: {
    id: 'settings.general.aboutYoroi.network.testnet',
    defaultMessage: '!!!Testnet Network',
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

const socialMediaLinks = [
  {
    url: 'https://twitter.com/YoroiWallet',
    svg: twitterSvg,
    message: messages.aboutYoroiTwitter,
  },
  {
    svgClass: styles.yoroiLogo,
    url: 'https://yoroi-wallet.com',
    svg: yoroiSvg,
    message: messages.aboutYoroiWebsite,
  },
  {
    url: 'https://www.facebook.com/Yoroi-wallet-399386000586822/',
    svg: facebookSvg,
    message: messages.aboutYoroiFacebook,
  },
  {
    url: 'https://www.youtube.com/channel/UCgFQ0hHuPO1QDcyP6t9KZTQ',
    svg: youtubeSvg,
    message: messages.aboutYoroiYoutube,
  },
  {
    url: 'https://t.me/emurgo',
    svg: telegramSvg,
    message: messages.aboutEmurgoTelegram,
  },
  {
    url: 'https://medium.com/@emurgo_io',
    svg: mediumSvg,
    message: messages.aboutYoroiMedium,
  },
  {
    url: 'https://github.com/Emurgo/yoroi-frontend',
    svg: githubSvg,
    message: messages.aboutYoroiGithub,
  },
];

const baseGithubUrl = 'https://github.com/Emurgo/yoroi-frontend/';

type Props = {|
  wallet: null | PublicDeriver<>,
|};

@observer
class AboutYoroiSettingsBlock extends Component<Props & InjectedLayoutProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { wallet, isRevampLayout, renderLayoutComponent } = this.props;
    let network;

    if (wallet) {
      const result = isTestnet(wallet.getParent().getNetworkInfo());
      network = result === true ? 'testnet' : 'mainnet';
    }

    const classicLayout = (
      <Box
        sx={{
          pb: '20px',
          mt: isRevampLayout ? '40px' : '32px',
          pt: !isRevampLayout && '30px',
          borderTop: !isRevampLayout && '1px solid var(--yoroi-palette-gray-200)',
        }}
        className={styles.component}
      >
        <Typography
          component="h2"
          variant={isRevampLayout ? 'body1' : 'h5'}
          fontWeight={500}
          mb={isRevampLayout ? '16px' : '12px'}
          color="ds.gray_c900"
        >
          {intl.formatMessage(messages.aboutYoroiLabel)}
        </Typography>

        {network && (
          <div className={styles.aboutLine}>
            <strong>{intl.formatMessage(messages.networkLabel)}</strong>&nbsp;
            {intl.formatMessage(messages[network])}
          </div>
        )}
        <div className={styles.aboutLine}>
          <strong>{intl.formatMessage(messages.versionLabel)}</strong>&nbsp;
          <ExplorableHash
            websiteName="Github"
            url={baseGithubUrl + 'releases/'}
            light={false}
            placementTooltip="bottom"
            onExternalLinkClick={handleExternalLinkClick}
          >
            <RawHash light={false}>{environment.getVersion()}</RawHash>
          </ExplorableHash>
        </div>
        <div className={styles.aboutLine}>
          <strong>{intl.formatMessage(messages.commitLabel)}</strong>&nbsp;
          <ExplorableHash
            websiteName="Github"
            url={baseGithubUrl + 'commit/' + environment.commit}
            light={false}
            placementTooltip="bottom-start"
            onExternalLinkClick={handleExternalLinkClick}
          >
            <RawHash light={false}>{environment.commit}</RawHash>
          </ExplorableHash>
        </div>
        {!environment.isProduction() && (
          <div className={styles.aboutLine}>
            <strong>{intl.formatMessage(messages.branchLabel)}</strong>&nbsp;
            <ExplorableHash
              websiteName="Github"
              url={baseGithubUrl + 'tree/' + environment.branch}
              light={false}
              placementTooltip="bottom-start"
              onExternalLinkClick={handleExternalLinkClick}
            >
              <RawHash light={false}>{environment.branch}</RawHash>
            </ExplorableHash>
          </div>
        )}
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
      </Box>
    );

    const revampLayout = (
      <Box
        sx={{
          pb: '20px',
          mt: '40px',
        }}
      >
        <Typography component="h2" variant="body1" fontWeight={500} mb="16px" color="ds.gray_c900">
          {intl.formatMessage(messages.aboutYoroiLabel)}
        </Typography>

        {network && (
          <LabelWithValue
            label={intl.formatMessage(messages.networkLabel)}
            value={intl.formatMessage(messages[network])}
          />
        )}

        <LabelWithValue
          label={intl.formatMessage(messages.versionLabel)}
          value={environment.getVersion()}
          url={baseGithubUrl + 'releases/'}
        />

        <LabelWithValue
          label={intl.formatMessage(messages.commitLabel)}
          value={environment.commit}
          url={baseGithubUrl + 'commit/' + environment.commit}
        />

        {!environment.isProduction() && (
          <LabelWithValue
            label={intl.formatMessage(messages.branchLabel)}
            value={environment.branch}
            url={baseGithubUrl + 'tree/' + environment.branch}
          />
        )}

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
      </Box>
    );

    return renderLayoutComponent({
      CLASSIC: classicLayout,
      REVAMP: revampLayout,
    });
  }
}

function LabelWithValue({
  label,
  value,
  url,
}: {|
  label: string,
  value: string,
  url?: string,
|}): Node {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Typography component="div" variant="body1" fontWeight={500} color="ds.gray_cmax">
        {label}
      </Typography>
      <Typography component="div"
        {...(url
          ? {
              as: Link,
              href: url,
              target: '_blank',
            }
          : {})}
        variant="body1"
        color="ds.gray_cmax"
        sx={{ textDecoration: 'none' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

LabelWithValue.defaultProps = {
  url: undefined,
};

export default (withLayout(AboutYoroiSettingsBlock): ComponentType<Props>);
