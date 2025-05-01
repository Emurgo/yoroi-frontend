// @flow
import type { Node } from 'react';
import { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import styles from './AboutYoroiSettingsBlock.scss';

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
import { handleExternalLinkClick } from '../../../../utils/routing';
import { Box, Button, Link, Typography } from '@mui/material';
// $FlowIgnore: suppressing this error
import { TestNetworkInfoModal } from '../../../../UI/components/TestNetworkInfoModal/TestNetworkInfoModal';
// $FlowIgnore: suppressing this error
import { IconWrapper, Icons } from '../../../../UI/components';
// $FlowIgnore: suppressing this error
import { useModal } from '../../../../UI/components/modals/ModalContext';
import LocalStorageApi from '../../../../api/localStorage';
import { networks } from '../../../../api/ada/lib/storage/database/prepackaged/networks';

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
    defaultMessage: '!!!Mainnet',
  },
  preprod: {
    id: 'settings.general.aboutYoroi.network.preprod',
    defaultMessage: '!!!Preprod',
  },
  preview: {
    id: 'settings.general.aboutYoroi.network.preview',
    defaultMessage: '!!!Preview',
  },
  commitLabel: {
    id: 'settings.general.aboutYoroi.commitLabel',
    defaultMessage: '!!!Commit:',
  },
  branchLabel: {
    id: 'settings.general.aboutYoroi.git.branch',
    defaultMessage: '!!!Branch:',
  },
  switchNetwork: {
    id: 'settings.general.aboutYoroi.switchNetwork',
    defaultMessage: '!!!SWITCH NETWORK',
  },
  modalTitle: {
    id: 'settings.general.testnetModal.title',
    defaultMessage: '!!!What are the test networks?',
  },
});

const basePageComponentPath = 'settings:general';

const socialMediaLinks = [
  {
    url: 'https://twitter.com/YoroiWallet',
    svg: twitterSvg,
    message: messages.aboutYoroiTwitter,
    componentId: `${basePageComponentPath}-twitterLink-linkButton`,
  },
  {
    svgClass: styles.yoroiLogo,
    url: 'https://yoroi-wallet.com',
    svg: yoroiSvg,
    message: messages.aboutYoroiWebsite,
    componentId: `${basePageComponentPath}-yoroiWebsiteLink-linkButton`,
  },
  {
    url: 'https://www.facebook.com/Yoroi-wallet-399386000586822/',
    svg: facebookSvg,
    message: messages.aboutYoroiFacebook,
    componentId: `${basePageComponentPath}-facebookLink-linkButton`,
  },
  {
    url: 'https://www.youtube.com/channel/UCgFQ0hHuPO1QDcyP6t9KZTQ',
    svg: youtubeSvg,
    message: messages.aboutYoroiYoutube,
    componentId: `${basePageComponentPath}-youtubeLink-linkButton`,
  },
  {
    url: 'https://t.me/emurgo',
    svg: telegramSvg,
    message: messages.aboutEmurgoTelegram,
    componentId: `${basePageComponentPath}-telegramLink-linkButton`,
  },
  {
    url: 'https://medium.com/@emurgo_io',
    svg: mediumSvg,
    message: messages.aboutYoroiMedium,
    componentId: `${basePageComponentPath}-mediumLink-linkButton`,
  },
  {
    url: 'https://github.com/Emurgo/yoroi-frontend',
    svg: githubSvg,
    message: messages.aboutYoroiGithub,
    componentId: `${basePageComponentPath}-githubLink-linkButton`,
  },
];

const baseGithubUrl = 'https://github.com/Emurgo/yoroi-frontend/';

type Props = {|
  wallet: null | { isTestnet: boolean, networkId: number, ... },
  onSwitchNetwork: () => void,
|};

const AboutYoroiSettingsBlock = ({ wallet, onSwitchNetwork }: Props): Node => {
  const { openModal, closeModal } = useModal();
  const intl = useIntl();
  const localStorageApi = new LocalStorageApi();
  const network = wallet && wallet.isTestnet ? 'testnet' : 'mainnet';
  const getNetworkValue = () => {
    const networkId = wallet && wallet.networkId;
    switch (networkId) {
      case networks.CardanoPreprodTestnet.NetworkId:
        return intl.formatMessage(messages.preprod);
      case networks.CardanoPreviewTestnet.NetworkId:
        return intl.formatMessage(messages.preview);
      default:
        return intl.formatMessage(messages.mainnet);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    (async () => {
      const isTestnetModalDisplayed: boolean = await localStorageApi.getTestnetModalDisplayed();
      if (wallet && !wallet.isTestnet && !isTestnetModalDisplayed) {
        console.log('should open testnet info modal')
        openModal({
          title: intl.formatMessage(messages.modalTitle),
          content: <TestNetworkInfoModal onClose={onCloseModalInfo} />,
          width: '648px',
          height: '360px',
          modalId: 'testNetworkInfoModal',
        });
      }
    })();
  }, []);

  const onCloseModalInfo = useCallback(async () => {
    await localStorageApi.setTestnetModalDisplayed(true);
    closeModal();
  }, [localStorageApi]);

  return (
    <Box
      sx={{
        pb: '20px',
        mt: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Typography component="h2" variant="body1" fontWeight={500} mb="16px" color="ds.text_gray_medium">
        {intl.formatMessage(messages.aboutYoroiLabel)}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {network && (
          <LabelWithValue
            label={intl.formatMessage(messages.networkLabel)}
            value={getNetworkValue()}
            showInfoToolTip
            handleTooltip={() => {
              openModal({
                title: intl.formatMessage(messages.modalTitle),
                content: <TestNetworkInfoModal onClose={() => closeModal()} />,
                width: '648px',
                height: '360px',
              });
            }}
            componentId={basePageComponentPath + '-networkInfo-text'}
          />
        )}

        <LabelWithValue
          label={intl.formatMessage(messages.versionLabel)}
          value={environment.getVersion()}
          url={baseGithubUrl + 'releases/'}
          componentId={basePageComponentPath + '-versionInfo-text'}
        />

        <LabelWithValue
          label={intl.formatMessage(messages.commitLabel)}
          value={environment.commit}
          url={baseGithubUrl + 'commit/' + environment.commit}
          componentId={basePageComponentPath + '-commitInfo-text'}
        />

        {!environment.isProduction() && (
          <LabelWithValue
            label={intl.formatMessage(messages.branchLabel)}
            value={environment.branch}
            url={baseGithubUrl + 'tree/' + environment.branch}
            componentId={basePageComponentPath + '-branchInfo-text'}
          />
        )}
      </Box>

      <Button
        onClick={onSwitchNetwork}
        variant="secondary"
        style={{ width: '200px' }}
        id={basePageComponentPath + '-switchNetwork-button'}
      >
        {intl.formatMessage(messages.switchNetwork)}
      </Button>

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
};

export default AboutYoroiSettingsBlock;

function LabelWithValue({
  label,
  value,
  url,
  componentId,
  showInfoToolTip,
  handleTooltip,
}: {|
  label: string,
  value: string,
  url?: string,
  componentId?: string,
  showInfoToolTip?: boolean,
  handleTooltip?: () => void,
|}): Node {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Typography component="div" variant="body1" fontWeight={500} color="ds.text_gray_medium">
        {label}
      </Typography>
      <Typography
        component="div"
        {...(url
          ? {
              as: Link,
              href: url,
              target: '_blank',
            }
          : {})}
        variant="body1"
        color="ds.text_gray_medium"
        sx={{ textDecoration: 'none' }}
        id={componentId || 'somewhere-someValue-text'}
      >
        {value}
      </Typography>
      {showInfoToolTip && <IconWrapper icon={Icons.InfoCircle} onClick={handleTooltip} asButton />}
    </Box>
  );
}

LabelWithValue.defaultProps = {
  url: undefined,
  componentId: undefined,
  showInfoToolTip: undefined,
  handleTooltip: undefined,
};
