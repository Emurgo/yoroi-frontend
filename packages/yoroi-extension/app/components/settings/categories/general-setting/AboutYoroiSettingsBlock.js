import { useEffect, useCallback } from 'react';
import { defineMessages } from 'react-intl';
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
import { Box, Button, IconButton, Link, Typography, styled } from '@mui/material';
// $FlowIgnore: suppressing this error
import { TestNetworkInfoModal } from '../../../../UI/components/TestNetworkInfoModal/TestNetworkInfoModal';
// $FlowIgnore: suppressing this error
import { Icon } from '../../../../UI/components';
// $FlowIgnore: suppressing this error
import { useModal } from '../../../../UI/components/modals/ModalContext';
import LocalStorageApi from '../../../../api/localStorage';

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



export const AboutYoroiSettingsBlock = ({ intl, wallet, onSwitchNetwork }) => {
  const { openModal, closeModal } = useModal()
  const localStorageApi = new LocalStorageApi();

  useEffect(() => {
    const getModalInfo = async () => {
      localStorageApi.unsetTestnetModalInfo()
      const lsModalInfoStr = await localStorageApi.getTestnetModalInfo();
      const selectedWalletId = wallet.publicDeriverId;
      const lsModalInfoSettings = JSON.parse(lsModalInfoStr || '{}');
      const modalSettings = lsModalInfoSettings[selectedWalletId];

      if (modalSettings === undefined) {
        openModal({
          title: intl.formatMessage(messages.modalTitle),
          content: <TestNetworkInfoModal intl={intl} onClose={onCloseModalInfo} />,
          width: '648px',
          height: '390px',
        });
      }
    }
    getModalInfo()
  }, [])


  const onCloseModalInfo = useCallback(async () => {
    const selectedWalletId = wallet.publicDeriverId;
    localStorageApi.setTestnetModalInfo(JSON.stringify({ [selectedWalletId]: true }));
    closeModal()
  }, [localStorageApi]);

  const network = wallet && wallet.isTestnet ? 'testnet' : 'mainnet';

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
            value={intl.formatMessage(messages[network])}
            showInfoToolTip
            handleTooltip={() => {
              openModal({
                title: intl.formatMessage(messages.modalTitle),
                content: <TestNetworkInfoModal intl={intl} onClose={() => closeModal} />,
                width: '648px',
                height: '390px',
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

}

const IconWrapper = styled(IconButton)(({ theme }) => ({
  cursor: 'pointer',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

const LabelWithValue = ({
  label,
  value,
  url,
  componentId,
  showInfoToolTip,
  handleTooltip,
}) => {
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
      {
        showInfoToolTip &&
        <IconWrapper onClick={handleTooltip}>
          <Icon.Info />
        </IconWrapper>
      }
    </Box >
  );
}

