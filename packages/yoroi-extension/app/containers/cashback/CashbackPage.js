// @flow
import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import styles from './styles.module.css'
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import SidebarContainer from '../SidebarContainer';
import FullscreenLayout from '../../components/layout/FullscreenLayout';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import globalMessages from '../../i18n/global-messages';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { useTheme } from '@mui/material';
import { walletSignData } from '../../api/ada';
import { getPublicDeriverById } from '../../../chrome/extension/background/handlers/yoroi/utils';
import Dialog from '../../components/widgets/Dialog';
import DialogCloseButton from '../../components/widgets/DialogCloseButton';
import DialogTextBlock from '../../components/widgets/DialogTextBlock'
import { Address } from '@emurgo/cardano-serialization-lib-browser'
import { Box, TextField, InputAdornment, IconButton, Tooltip, Typography, DialogContentText } from '@mui/material';

type Props = StoresAndActionsProps;

type InjectedLayoutProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

type IframeMessageData = {|
  action: string,
    overlayBgColor ?: string,
    messageToSign: string,
      amount: number
        |};

const CashbackPageContainer: React$ComponentType<Props> = observer((props: AllProps) => {
  const { actions, stores } = props;
  const theme = useTheme();
  // const intl = useContext(IntlContext);

  const iframeRef = useRef < HTMLIFrameElement | null > (null);
  const [iframeSrc, setIframeSrc] = useState('');
  const [status, setStatus] = useState('loading');
  const [popup, setPopup] = useState(false);
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [message, setMessage] = useState('')
  const [claimAmount, setClaimAmount] = useState(0)
  const [signaturePopup, setSignaturePopup] = useState(false);
  const [overlayBgColor, setOverlayBgColor] = useState('#000000fa');

  const fetchIframeUrl = useCallback(async () => {
    try {
      const publicDeriver = stores.wallets.selected;
      if (!publicDeriver) throw Error('no publicDeriver');
      const walletAddress = Address.from_hex(publicDeriver.externalAddressesByType[CoreAddressTypes.CARDANO_BASE][0].address).to_bech32();

      const response = await fetch(`${environment.bringBaseUrl}check/portal`, {
        method: 'POST',
        headers: {
          'x-api-key': environment.bringIdentifier,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();
      const url = new URL(data.iframeUrl);
      url.searchParams.set('token', data.token);
      url.searchParams.set('theme', theme.name.split('-')[0]);

      setIframeSrc(url.href);
      setStatus('done');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [stores.wallets.selected]);

  function stringToHex(str) {
    return Array.from(str)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

  const signMessage = useCallback(async (message: string, password: string) => {
    const wallet = stores.wallets.selected;
    if (!wallet) throw Error('no publicDeriver');
    const address = wallet.externalAddressesByType[CoreAddressTypes.CARDANO_BASE][0].address;
    const publicDeriver = await getPublicDeriverById(wallet.publicDeriverId)
    try {
      const res = await walletSignData(publicDeriver, password, address, stringToHex(message))
      iframeRef.current?.contentWindow.postMessage({ to: 'bringweb3', action: 'SIGNATURE', ...res, message, address }, '*');
      setSignaturePopup(false)
      setPassword('')
    } catch (error) {
      setErrMsg(error.message)
      // console.warn(error);
    }
  }, []);

  const handleMessage = useCallback(async (event: MessageEvent) => {
    const iframeOrigin = new URL(iframeSrc).origin;

    if (event.origin !== iframeOrigin) {
      return;
    }

    const messageData: IframeMessageData = (event.data: any);

  if (messageData.action === 'SIGN_MESSAGE') {
    setClaimAmount(messageData.amount)

    setMessage(messageData.messageToSign)
    setSignaturePopup(true)
  } else if (messageData.action === 'POPUP_OPENED') {
    setPopup(true);
    setOverlayBgColor(messageData.overlayBgColor || overlayBgColor);
  } else if (messageData.action === 'POPUP_CLOSED') {
    setPopup(false);
  }
}, [iframeSrc, overlayBgColor]);

useEffect(() => {
  if (environment.isLight) {
    actions.router.goToRoute.trigger({
      route: ROUTES.MY_WALLETS,
    });
  }
  if (!iframeSrc) fetchIframeUrl();

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, [iframeSrc, fetchIframeUrl, handleMessage]);

const closePopup = useCallback(() => {
  iframeRef.current?.contentWindow.postMessage({ to: 'bringweb3', action: 'CLOSE_POPUP' }, '*');
  setPopup(false);
}, []);

const abortClaim = useCallback(() => {
  iframeRef.current?.contentWindow.postMessage({ to: 'bringweb3', action: 'ABORT_SIGN_MESSAGE' }, '*');
  setSignaturePopup(false)
  setPassword('')
}, []);

const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;

return (
  <TopBarLayout
    banner={<BannerContainer actions={actions} stores={stores} />}
    sidebar={sidebarContainer}
    navbar={
      <NavBarContainerRevamp
        actions={actions}
        stores={stores}
        title={<NavBarTitle title={'Cashback'} />}
      // title={<NavBarTitle title={intl.formatMessage(globalMessages.sidebarCashback)} />}
      />
    }
  >
    <FullscreenLayout bottomPadding={0}>
      <Suspense fallback={null}>
        {signaturePopup ?
          <Dialog
            title='CLAIM CASHBACK'
            closeOnOverlayClick
            closeButton={<DialogCloseButton />}
            onClose={abortClaim}
            actions={[{
              label: 'CONFIRM',
              primary: true,
              disabled: !password,
              onClick: () => signMessage(message, password)
            }]}
          >
            <Box>
              <Typography sx={{ marginBottom: "16px", color: theme.name === 'light-theme' ? '#242838' : '#E1E6F5' }}>
                Enter your password to claim cashback rewards.
              </Typography>
              <Typography sx={{ color: theme.name === 'light-theme' ? '#6B7384' : '#7C85A3' }}>
                Message
              </Typography>
              <DialogContentText sx={{
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: theme.name === 'light-theme' ? '#242838' : '#E1E6F5'
              }}>
                {message}
              </DialogContentText>
              <TextField
                className="walletPassword"
                value={password}
                label="Password"
                type="password"
                // endAdornment={
                //   <InputAdornment position="end">
                //     <IconButton
                //       aria-label="toggle password visibility"
                //       onClick={() => setShowPassword(!showPassword)}
                //       edge="end"
                //     >
                //       {!showPassword ? <Icon.VisibilityOff /> : <Icon.VisibilityOn />}
                //     </IconButton>
                //   </InputAdornment>
                // }
                onChange={e => {
                  setPassword(e.target.value);
                }}
                error={!!errMsg}
                disabled={false}
              />
            </Box>
          </Dialog>
          : null}
        {popup ? (
          <div
            className={styles.iframe_overlay}
            style={{ background: overlayBgColor }}
            onClick={closePopup}
          />
        ) : null}
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            id="bringweb3"
            className={styles.iframe}
            src={iframeSrc}
            width="100%"
            height="100%"
          />
        )}
      </Suspense>
    </FullscreenLayout>
  </TopBarLayout >
);
});

export default (withLayout(CashbackPageContainer): React$ComponentType < Props >);