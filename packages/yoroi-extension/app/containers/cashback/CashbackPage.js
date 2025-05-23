// @flow
import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import type { StoresProps } from '../../stores';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import SidebarContainer from '../SidebarContainer';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import globalMessages from '../../i18n/global-messages';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { walletSignData, encodeHardwareWalletSignResult } from '../../api/ada';
import { getPublicDeriverById } from '../../../chrome/extension/background/handlers/yoroi/utils';
import Dialog from '../../components/widgets/Dialog';
import DialogCloseButton from '../../components/widgets/DialogCloseButton';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { useTheme, Box, TextField, Typography, DialogContentText } from '@mui/material';
import { LedgerConnect } from '../../utils/hwConnectHandler';
import { MessageAddressFieldType, AddressType } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { WrongPassphraseError } from '../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { IncorrectWalletPasswordError } from '../../api/common/errors';
import { convertToLocalizableError } from '../../domain/LedgerLocalizedError';
import LocalizableError from '../../i18n/LocalizableError';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { injectIntl, defineMessages } from 'react-intl';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { forceNonNull } from '../../coreUtils';
import { constructPlate32 } from '../../components/topbar/WalletCard';
import LocalStorageApi from '../../api/localStorage';
import DisclaimerDialog from '../../components/widgets/DisclaimerDialog';
import type { BringConfigType, ConfigType } from '../../../config/config-types';

const messages = defineMessages({
  claim: {
    id: 'cashback.claim.dialog.title',
    defaultMessage: '!!!CLAIM CASHBACK',
  },
  passwordClaimInstruction: {
    id: 'cashback.claim.dialog.instruction.password',
    defaultMessage: '!!!Enter your password to claim cashback rewards.',
  },
  hardwardClaimInstruction: {
    id: 'cashback.claim.dialog.instruction.hardware',
    defaultMessage: '!!!Confirm on your hardware wallet to claim cashback rewards.',
  },
  message: {
    id: 'cashback.claim.dialog.message.label',
    defaultMessage: '!!!Message',
  },
  notCurrentText: {
    id: 'cashback.not.current.warning.text',
    defaultMessage:
      "!!!Your cashback rewards are currently linked to another wallet. To claim your ADA cashback, either switch to the rewards wallet or change the rewards wallet to the one you're using now. You can always access settings at anytime to change your cashback wallet and make claiming rewards relevant for you.",
  },
  currentWalletLabel: {
    id: 'cashback.not.current.warning.current',
    defaultMessage: '!!!Current rewards wallet',
  },
  warning: {
    id: 'cashback.not.current.warning.title',
    defaultMessage: '!!!WARNING',
  },
  useThis: {
    id: 'cashback.not.current.warning.use.this',
    defaultMessage: '!!!use this wallet',
  },
  keep: {
    id: 'cashback.not.current.warning.keep',
    defaultMessage: '!!!keep current wallet',
  },
  chooseTitle: {
    id: 'cashback.not.current.warning.title.choose',
    defaultMessage: '!!!wrong wallet',
  },
  setThis: {
    id: 'cashback.not.current.warning.button.set.this',
    defaultMessage: '!!!set this wallet',
  },
  switch: {
    id: 'cashback.not.current.warning.button.switch',
    defaultMessage: '!!!switch wallet',
  },
  chooseText1: {
    id: 'cashback.not.current.warning.text.choose.1',
    defaultMessage: '!!!Your cashback rewards are currently linked to another wallet.',
  },
  chooseText2: {
    id: 'cashback.not.current.warning.text.choose.2',
    defaultMessage: '!!!Switch wallet to access your rewards or set this wallet as your cashback wallet.',
  },
  setCurrentTitle: {
    id: 'cashback.not.current.warning.title.set.current',
    defaultMessage: '!!!Set my Current Wallet as my Cashback Wallet',
  },
  no: {
    id: 'cashback.not.current.warning.button.no',
    defaultMessage: '!!!no',
  },
  yes: {
    id: 'cashback.not.current.warning.button.yes',
    defaultMessage: '!!!yes',
  },
  switchText: {
    id: 'cashback.not.current.warning.text.switch',
    defaultMessage:
      '!!!You will no longer be able to claim rewards linked to your previous cashback wallet until you link it again.',
  },
});

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

type NotCurrentWalletModalProps = {|
  onSetCurrentAsCashbackWallet: () => void,
  onSwitchToCashbackWallet: () => void,
  shownCashbackWallet: {
    plate: {|
      ImagePart: string,
      TextPart: string,
    |},
    name: string,
    ...
  },
  intl: $npm$ReactIntl$IntlShape,
|};

const NotCurrentWalletModal = injectIntl(
  observer((props: NotCurrentWalletModalProps) => {
    const { intl } = props;

    const [state, setState] = useState<'switchOrSet' | 'confirmSet'>('switchOrSet');

    if (state === 'switchOrSet') {
      return (
        <Dialog
          title={intl.formatMessage(messages.chooseTitle)}
          dialogActions={[
            {
              label: intl.formatMessage(messages.setThis),
              onClick: () => {
                setState('confirmSet');
              },
            },
            {
              label: intl.formatMessage(messages.switch),
              primary: true,
              onClick: props.onSwitchToCashbackWallet,
            },
          ]}
        >
          <Typography sx={{ fontSize: '16px', lineHeight: '24px' }} color="ds.text_gray_medium">
            {intl.formatMessage(messages.chooseText1)}
          </Typography>
          <Typography sx={{ fontSize: '16px', lineHeight: '24px' }} color="ds.text_gray_medium">
            {intl.formatMessage(messages.chooseText2)}
          </Typography>
        </Dialog>
      );
    }

    return (
      <Dialog
        title={intl.formatMessage(messages.setCurrentTitle)}
        dialogActions={[
          {
            label: intl.formatMessage(messages.no),
            onClick: () => {
              setState('switchOrSet');
            },
          },
          {
            label: intl.formatMessage(messages.yes),
            primary: true,
            onClick: props.onSetCurrentAsCashbackWallet,
          },
        ]}
      >
        <Typography sx={{ fontSize: '16px', lineHeight: '24px' }} color="ds.text_gray_medium">
          {intl.formatMessage(messages.switchText)}
        </Typography>
        <Typography sx={{ fontSize: '12px', fontHeight: '16px', lineHeight: '16px' }} color="ds.text_gray_medium">
          {intl.formatMessage(messages.currentWalletLabel)}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
          {constructPlate32(props.shownCashbackWallet.plate)[1]}
          <Typography
            sx={{
              fontWeight: '500px',
              fontSize: '16px',
              lineHeight: '24px',
              marginTop: 'auto',
              marginBottom: 'auto',
              marginLeft: '1em',
            }}
            color="ds.text_gray_medium"
          >
            {props.shownCashbackWallet.plate.TextPart}
          </Typography>
        </Box>
      </Dialog>
    );
  })
);

type AllProps = {| ...StoresProps, intl: $npm$ReactIntl$IntlShape |};

type IframeMessageData = {|
  action: string,
  overlayBgColor?: string,
  messageToSign: string,
  amount: number,
|};

const canUseSandbox = environment.isDev() || environment.isNightly();

const CashbackPageContainer = observer((props: AllProps) => {
  const { stores, intl } = props;
  const wallet = stores.wallets.selected;
  if (!wallet) throw Error('no publicDeriver');

  const theme = useTheme();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeSrc, setIframeSrc] = useState('');
  const [popup, setPopup] = useState(false);
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [message, setMessage] = useState('');
  const [signaturePopup, setSignaturePopup] = useState(false);
  const [overlayBgColor, setOverlayBgColor] = useState('#000000fa');

  const bringSandboxRequest = stores.profile.getBringSandboxRequest;
  const isBringSandbox: ?boolean = useMemo(() => canUseSandbox && bringSandboxRequest.result, [bringSandboxRequest.result]);

  const fetchIframeUrl = useCallback(async () => {
    const bringConfig: BringConfigType = isBringSandbox ? CONFIG.bringSandbox : CONFIG.bring;

    try {
      const publicDeriver = stores.wallets.selected;
      if (!publicDeriver) throw Error('no publicDeriver');
      const walletAddress = RustModule.WalletV4.Address.from_hex(
        publicDeriver.externalAddressesByType[CoreAddressTypes.CARDANO_BASE][0].address
      ).to_bech32();

      const response = await fetch(`${bringConfig.baseUrl}check/portal`, {
        method: 'POST',
        headers: {
          'x-api-key': bringConfig.identifier,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();
      const url = new URL(data.iframeUrl);
      url.searchParams.set('token', data.token);
      url.searchParams.set('theme', theme.name.split('-')[0]);

      setIframeSrc(url.href);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [stores.wallets.selected, isBringSandbox]);

  function stringToHex(str) {
    return Array.from(str)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

  const signMessage = useCallback(async (msg: string, pwd: string) => {
    const { address, addressing } = wallet.externalAddressesByType[CoreAddressTypes.CARDANO_BASE][0];

    try {
      let res;
      if (wallet.type === 'mnemonic') {
        const publicDeriver = await getPublicDeriverById(wallet.publicDeriverId);
        try {
          res = await walletSignData(publicDeriver, pwd, address, stringToHex(msg));
        } catch (error) {
          if (error instanceof WrongPassphraseError) {
            throw new IncorrectWalletPasswordError();
          }
          throw error;
        }
      } else if (wallet.type === 'ledger') {
        const ledgerConnect = new LedgerConnect({
          locale: stores.profile.currentLocale,
        });
        try {
          const network = getNetworkById(wallet.networkId);
          const config = network.BaseConfig[0];
          const messageHex = stringToHex(msg);
          const hashPayload = true;
          const { signatureHex, signingPublicKeyHex, addressFieldHex } = await ledgerConnect.signMessage({
            serial: null,
            params: {
              preferHexDisplay: false,
              messageHex,
              signingPath: addressing.path,
              hashPayload,
              addressFieldType: MessageAddressFieldType.ADDRESS,
              address: {
                type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
                params: {
                  spendingPath: addressing.path,
                  stakingPath: wallet.stakingAddressing.addressing.path,
                },
              },
              network: {
                protocolMagic: config.ByronNetworkId,
                networkId: Number(config.ChainNetworkId),
              },
            },
          });
          res = await encodeHardwareWalletSignResult(addressFieldHex, signatureHex, messageHex, signingPublicKeyHex, hashPayload);
        } catch (error) {
          throw new convertToLocalizableError(error);
        }
      } else {
        throw new Error('unsupported wallet type');
      }
      iframeRef.current?.contentWindow.postMessage(
        {
          to: 'bringweb3',
          action: 'SIGNATURE',
          ...res,
          message: msg,
          address,
        },
        '*'
      );
      setSignaturePopup(false);
      setPassword('');
    } catch (error) {
      setErrMsg(error instanceof LocalizableError ? intl.formatMessage(error) : error.message);
    }
  }, []);

  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      const iframeOrigin = new URL(iframeSrc).origin;

      if (event.origin !== iframeOrigin) {
        return;
      }

      const messageData: IframeMessageData = (event.data: any);

      if (messageData.action === 'SIGN_MESSAGE') {
        setMessage(messageData.messageToSign);
        setSignaturePopup(true);
      } else if (messageData.action === 'POPUP_OPENED') {
        setPopup(true);
        setOverlayBgColor(messageData.overlayBgColor || overlayBgColor);
      } else if (messageData.action === 'POPUP_CLOSED') {
        setPopup(false);
      }
    },
    [iframeSrc, overlayBgColor]
  );

  useEffect(() => {
    if (environment.isLight) {
      stores.routing.goToRoute({
        route: ROUTES.WALLETS.ROOT,
      });
    }
    if (!iframeSrc) fetchIframeUrl();

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [iframeSrc, fetchIframeUrl, handleMessage]);

  // If the current cashback wallet is not the current wallet, this value initially holds the current cashback
  // wallet, to be shown in a warning dialog.
  const [shownCashbackWallet, setShownCashbackWallet] = useState(null);

  useEffect(() => {
    stores.wallets.getCashbackWalletRequest
      .execute()
      .then(currentCashbackWallet => {
        if (currentCashbackWallet && currentCashbackWallet !== stores.wallets.selected) {
          setShownCashbackWallet(currentCashbackWallet);
          setPopup(true);
        }
        return 'nonsense';
      })
      .catch(console.error);
  }, [stores.wallets.selected?.publicDeriverId]);

  const [shouldShowDisclaimer, setShouldShowDisclaimer] = useState(false);

  useEffect(() => {
    const localStorageApi = new LocalStorageApi();
    localStorageApi
      .isDisclaimerShown('cashback')
      .then(result => {
        if (!result) {
          setShouldShowDisclaimer(true);
          setPopup(true);
        }
        return 'nonsense';
      })
      .catch(console.error);
  }, []);

  const closePopup = useCallback(() => {
    iframeRef.current?.contentWindow.postMessage({ to: 'bringweb3', action: 'CLOSE_POPUP' }, '*');
    setPopup(false);
  }, []);

  const abortClaim = useCallback(() => {
    iframeRef.current?.contentWindow.postMessage({ to: 'bringweb3', action: 'ABORT_SIGN_MESSAGE' }, '*');
    setSignaturePopup(false);
    setPassword('');
    setErrMsg('');
  }, []);

  const sidebarContainer = <SidebarContainer stores={stores} />;

  return (
    <TopBarLayout
      banner={<BannerContainer stores={stores} />}
      sidebar={sidebarContainer}
      navbar={
        <NavBarContainerRevamp
          stores={stores}
          title={
            <NavBarTitle title={intl.formatMessage(globalMessages.sidebarCashback) + (isBringSandbox ? ' (sandbox)' : '')} />
          }
        />
      }
    >
      <Suspense fallback={null}>
        {shouldShowDisclaimer && (
          <DisclaimerDialog
            onProceed={() => {
              setShouldShowDisclaimer(false);
              if (!shownCashbackWallet) {
                setPopup(false);
              }
              const localStorageApi = new LocalStorageApi();
              localStorageApi.setShownDisclaimer('cashback');
            }}
          />
        )}

        {shownCashbackWallet && !shouldShowDisclaimer && (
          <NotCurrentWalletModal
            shownCashbackWallet={shownCashbackWallet}
            onSetCurrentAsCashbackWallet={() => {
              stores.wallets.setCashbackWallet(forceNonNull(stores.wallets.selected).publicDeriverId);
              setShownCashbackWallet(null);
              setPopup(false);
            }}
            onSwitchToCashbackWallet={() => {
              stores.wallets.setActiveWallet({ publicDeriverId: shownCashbackWallet.publicDeriverId });
              setShownCashbackWallet(null);
              setPopup(false);
            }}
          />
        )}

        {signaturePopup ? (
          <Dialog
            title={intl.formatMessage(messages.claim)}
            closeOnOverlayClick
            closeButton={<DialogCloseButton />}
            onClose={abortClaim}
            dialogActions={[
              {
                label: intl.formatMessage(globalMessages.confirm),
                primary: true,
                disabled: wallet.type === 'mnemonic' && !password,
                onClick: () => signMessage(message, password),
              },
            ]}
          >
            <Box>
              <Typography
                sx={{
                  marginBottom: '16px',
                  color: theme.name === 'light-theme' ? '#242838' : '#E1E6F5',
                }}
              >
                {intl.formatMessage(
                  wallet.type === 'mnemonic' ? messages.passwordClaimInstruction : messages.hardwardClaimInstruction
                )}
              </Typography>
              <Typography sx={{ color: theme.name === 'light-theme' ? '#6B7384' : '#7C85A3' }}>
                {intl.formatMessage(messages.message)}
              </Typography>
              <DialogContentText
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: theme.name === 'light-theme' ? '#242838' : '#E1E6F5',
                }}
              >
                {message}
              </DialogContentText>
              {wallet.type === 'mnemonic' && (
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
              )}
              <Typography color="ds.text_error">{errMsg}</Typography>
            </Box>
          </Dialog>
        ) : null}

        {popup ? (
          // eslint-disable-next-line
          <div className={styles.iframe_overlay} style={{ background: overlayBgColor }} onClick={closePopup} />
        ) : null}

        {iframeSrc && (
          <iframe
            title="cashback"
            ref={iframeRef}
            id="bringweb3"
            className={styles.iframe}
            src={iframeSrc}
            style={{ verticalAlign: 'bottom' }}
            width="100%"
            height="100%"
          />
        )}
      </Suspense>
    </TopBarLayout>
  );
});

export default (injectIntl(CashbackPageContainer): React$ComponentType<StoresProps>);
