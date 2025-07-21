import { useEffect, useState } from 'react';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import NavBarContainerRevamp from '../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { Box, Typography, Checkbox, FormControlLabel, } from '@mui/material';
import TextField from '../../components/common/TextField';
import { ReactComponent as ErrorTriangleIcon } from '../../assets/images/revamp/error.triangle.svg';
import BigNumber from 'bignumber.js';
import { getAllocatedAddresses, checkClaimForAddress, claimForAddress, getClaimMessage } from '../../api/ada/midnight';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { addressHexToBech32 } from '../../api/ada/lib/cardanoCrypto/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { LoadingButton } from '@mui/lab';
import Dialog from '../../components/widgets/Dialog';
import { WrongPassphraseError } from '../../api/ada/lib/cardanoCrypto/cryptoErrors';

const messages = defineMessages({
  size: {
    id: 'airdrop.size',
    defaultMessage: '!!!Your allocation size',
  },
  destinationAddress: {
    id: 'airdrop.destinationAddress',
    defaultMessage: '!!!Your destination address',
  },
  terms: {
    id: 'airdrop.terms',
    defaultMessage: '!!!Terms & Conditions',
  },
  agree: {
    id: 'airdrop.agree',
    defaultMessage: '!!!By checking this box I confirm that I have read and understood the Glacier Drop terms and conditions for this claim.',
  },
  claim: {
    id: 'airdrop.claim',
    defaultMessage: '!!!claim allocation',
  },
  noAllocTitle: {
    id: 'aidrop.noAllocTitle',
    defaultMessage: '!!!No eligible addresses found in your wallet',
  },
  noAllocText: {
    id: 'aidrop.noAllocText',
    defaultMessage: '!!!None of the addresses provided are eligible for an allocation',
  },
  trezorTitle: {
    id: 'airdrop.trezorTitle',
    defaultMessage: '!!!Trezor not supported',
  },
  trezorText: {
    id: 'airdrop.trezorText',
    defaultMessage: '!!!Claiming is currently unavailable for Trezor users. Please use a different wallet to proceed.',
  },
  claimDialogTitle: {
    id: 'airdrop.claimDialogTitle',
    defaultMessage: '!!!sign message',
  },
  ledgerClaimDialogTitle: {
    id: 'airdrop.ledgerClaimDialogTitle',
    defaultMessage: '!!!sign message { index } of { total }',
  },
  wrongPassword: {
    id: 'airdrop.wrongPassword',
    defaultMessage: '!!!Wrong password',
  },
  mnemonicClaimDialogText: {
    id: 'airdrop.mnemonicClaimDialogText',
    defaultMessage: '!!!Please sign message to prove ownership of your assets. Signing this message will not affect your wallet’s balance in any way and does not require you to pay any fees.',
  },
  ledgerClaimDialogText: {
    id: 'airdrop.ledgerClaimDialogText',
    defaultMessage: '!!!Signing this messages proves you have ownership of the address you want to use to claim NIGHT. Each message must be signed individually per address',
  },
  messageLabel: {
    id: 'airdrop.messageLabel',
    defaultMessage: '!!!Message',
  },
});

type AddressClaimData = {
  addrHex: string,
  addrBech32: string,
  path: Array<number>,
  value: number,
};

interface Props {
  stores: {
    wallets: {
      selected: null | {
        publicDeriverId: number,
        type: 'mnemonic' | 'ledger' | 'trezor',
        allAddressesByType: {
          address: string,
        }[][],
      },
    },
    profile: {
      currentLocale: string,
    },
  }
}

export default function AirdropPage({ stores }: Props) {
  const intl = useIntl();
  const wallet = stores.wallets.selected;
  if (!wallet) {
    return null;
  }
  const isTrezor = wallet.type === 'trezor';
  //  @ts-ignore
  const dstAddr = addressHexToBech32(wallet.allAddressesByType[CoreAddressTypes.CARDANO_BASE][0].address);

  // null means querying
  const [alloc, setAlloc] = useState<BigNumber | null>(null);
  const [isTermsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [unclaimedAddrs, setUnclaimedAddrs] = useState<AddressClaimData[]>([]);
  const [isClaimDialog, setClaimDialog] = useState(false);
  const [isClaimDone, setClaimDone] = useState(false);

  useEffect(() => {
    (async () => {
      const allocatedAddrs: AddressClaimData[] = await getAllocatedAddresses(wallet);
      const unclaimedAddrs: AddressClaimData[] = [];
      for (const addr of allocatedAddrs) {
        const claimed = await checkClaimForAddress(addr.addrBech32);
        if (!claimed) {
          unclaimedAddrs.push(addr);
        }
      }

      if (allocatedAddrs.length > 0 && unclaimedAddrs.length === 0) {
        setClaimDone(true);
      }
      setAlloc(allocatedAddrs.reduce((accu, addrData) => accu.plus(addrData.value), new BigNumber('0')));
      setUnclaimedAddrs(unclaimedAddrs);
    })();
    return () => {
      // switch wallet
      setAlloc(null);
      setClaimDone(false);
      setUnclaimedAddrs([]);
    };
  }, [wallet.publicDeriverId]);

  const showClaimDialog = async () => {
    setClaimDialog(true);
  }

  const closeClaimDialog = async () => {
    setClaimDialog(false);
  }

  const claim = async (password) => {
    if (wallet.type === 'mnemonic') {
      for (const addr of unclaimedAddrs) {
        await claimForAddress(wallet, addr, password, stores.profile.currentLocale);
      }
      setClaimDialog(false);
      setClaimDone(true);
    } else { // ledger
      await claimForAddress(wallet, unclaimedAddrs[0], password, stores.profile.currentLocale);
    }
  }

  let content;

  if (!alloc) {
    content = (<LoadingSpinner />);
  } else if (alloc.isZero()) {
    content = (
      <Box
        sx={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '612px',
          borderRadius: '8px',
          bgcolor: 'ds.bg_color_contrast_min',
          padding: '24px',
        }}
      >
        {/*  @ts-ignore */}
        <Typography variant="h1xl">
          {intl.formatMessage(messages.noAllocTitle)}
        </Typography>
        <Box>
          {/*  @ts-ignore */}
          <Typography variant="body1" as="span">
            {intl.formatMessage(messages.noAllocTitle)}
          </Typography>
          &nbsp;
          {/*  @ts-ignore */}
          <Typography variant="body1" as="span">
            <a href="">
              {intl.formatMessage(globalMessages.learnMore)}
            </a>
          </Typography>
        </Box>
      </Box>
    );
  } else {
    content = (<>
      <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1}}>
        <Box
          sx={{
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '612px',
          }}
        >
          <Box
            sx={{
              borderRadius: '8px',
              bgcolor: 'ds.bg_color_contrast_min',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px'}}>
              <Typography variant="body2" color="ds.text_gray_low">
                {intl.formatMessage(messages.size)}
              </Typography>
              {/*  @ts-ignore */}
              <Typography variant="h1xl">
                {alloc.toFormat()} NIGHT
              </Typography>
            </Box>
            {!isTrezor && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <Typography variant="body2" color="ds.text_gray_low">
                  {intl.formatMessage(messages.destinationAddress)}
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {dstAddr}
                </Typography>
              </Box>
            )}
          </Box>
          {!isTrezor ? (
            !isClaimDone && (<>
              <Terms />
              <FormControlLabel
                label={intl.formatMessage(messages.agree)}
                control={
                  <Checkbox
                    checked={isTermsAgreed}
                    onChange={()=>{ setTermsAgreed(!isTermsAgreed); }}
                    sx={{ marginRight: '8px' }}
                  />
                }
                sx={{
                  marginTop: '24px',
                  color: 'ds.text_gray_medium',
                }}
              />
            </>)
          ) : ( // if trezor
            <Box
              sx={{
                borderRadius: '8px',
                bgcolor: 'ds.sys_magenta_100',
                padding: '24px',
                marginTop: '24px',
              }}
            >
              <Box>
                {/*  @ts-ignore */}
                <Box as="span" sx={{ verticalAlign: 'middle' }}>
                  <ErrorTriangleIcon/>
                </Box>
                {/*  @ts-ignore */}
                <Typography
                  sx={{ verticalAlign: 'middle' }}
                  as="span" variant="body1"
                  fontWeight={500}
                  color="ds.sys_magenta_500"
                >
                  {intl.formatMessage(messages.trezorTitle)}
                </Typography>
              </Box>
              <Typography variant="body1" color="ds.text_gray_medium">
                {intl.formatMessage(messages.trezorText)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      {!isTrezor && !isClaimDone && (
        <Box sx={{ height: '96px', display: 'flex' }}>
          <LoadingButton
            //  @ts-ignore
            variant="primary"
            sx={{ margin: 'auto' }}
            disabled={!isTermsAgreed || unclaimedAddrs.length === 0}
            loading={isClaimDialog}
            onClick={showClaimDialog}
          >
            {intl.formatMessage(messages.claim)}
          </LoadingButton>
        </Box>
      )}
    </>);
  }
  return (
    <TopBarLayout
      banner={<BannerContainer stores={stores}/>}
      sidebar={<SidebarContainer stores={stores}/>}
      navbar={
        <NavBarContainerRevamp
          stores={stores}
          title={<NavBarTitle title={intl.formatMessage(globalMessages.airdrop)}/>}
        />
      }
      showInContainer
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {content}
        {isClaimDialog && (
          wallet.type === 'mnemonic' ? (
            <ClaimDialog
              onClose={closeClaimDialog}
              onClaim={claim}
              message={getClaimMessage(unclaimedAddrs[0])}
            />
          ) : (
            <LedgerClaimDialog
              onClose={closeClaimDialog}
              onClaim={claim}
              message={getClaimMessage(unclaimedAddrs[0])}
            />
          )
        )}
      </Box>
    </TopBarLayout>
  );
}

function LedgerClaimDialog(props: {
  onClose: () => void,
  message: string,
  onClaim: (_password: string) => Promise<void>
}) {
  const intl = useIntl();

  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setClaiming] = useState(false);

  const onClaim = async () => {
    setClaiming(true);
    setError(null);
    try {
      await props.onClaim('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error));
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Dialog
      withCloseButton
      onClose={props.onClose}
      title={intl.formatMessage(messages.claimDialogTitle)}
      dialogActions={[
        {
          label: intl.formatMessage(messages.claimDialogTitle),
          primary: true,
          disabled: isClaiming,
          onClick: onClaim,
        },
      ]}
    >
      <Typography variant="body1">
        {intl.formatMessage(messages.ledgerClaimDialogText)}
      </Typography>
      {isClaiming ? (
        <Box sx={{ marginTop: '16px', marginBottom: '16px' }}>
          <LoadingSpinner />
        </Box>
      ) : (
        <Box sx={{ height: '39px' }}></Box>
      )}
      <Typography variant="body1" color="ds.text_gray_low">
        {intl.formatMessage(messages.messageLabel)}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium">
        {props.message}
      </Typography>
      <Typography component="div" variant="body2" color="ds.text_error">
        {error}
      </Typography>
    </Dialog>
  );
}

function ClaimDialog(props: { onClose: () => void, onClaim: (password: string) => Promise<void>, message: string }) {
  const intl = useIntl();
  const wrongPasswordErrorMessage = intl.formatMessage(messages.wrongPassword);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isClaiming, setClaiming] = useState(false);

  const onClaim = async () => {
    setClaiming(true);
    setError(null);
    try {
      await props.onClaim(password);
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        setPasswordError(wrongPasswordErrorMessage);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error));
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Dialog
      withCloseButton
      onClose={props.onClose}
      title={intl.formatMessage(messages.claimDialogTitle)}
      dialogActions={[
        {
          label: intl.formatMessage(messages.claimDialogTitle),
          primary: true,
          disabled: (password.length === 0) || isClaiming,
          onClick: onClaim,
        },
      ]}
    >
      <Typography variant="body1" color="ds.text_gray_medium">
        {intl.formatMessage(messages.mnemonicClaimDialogText)}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_low" sx={{ marginTop: '16px' }}>
        {intl.formatMessage(messages.messageLabel)}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium" sx={{ marginBottom: '16px' }}>
        {props.message}
      </Typography>
      <TextField
        error={passwordError}
        type="password"
        className="walletPassword"
        value={password}
        label={intl.formatMessage(globalMessages.passwordLabel)}
        isLoading={isClaiming}
        onChange={e => {
          if (error === wrongPasswordErrorMessage) {
            setPasswordError(null);
          }
          setPassword(e.target.value);
        }}
        autoFocus
      />
      <Typography component="div" variant="body2" color="ds.text_error">
        {error}
      </Typography>
    </Dialog>
  );
}

function Terms() {
  const intl = useIntl();
  return (<>
    <Typography variant="body1" color="ds.text_gray_min" sx={{ marginTop: '32px', marginBottom: '16px' }}>
      {intl.formatMessage(messages.terms)}
    </Typography>
    <Typography variant="body1">
      <Typography fontWeight={500}>1. Acceptance of Terms</Typography>

      <p>By participating in the [Project Name] Airdrop ("Airdrop"), you ("Participant") agree to be bound by these Terms of Use ("Terms"). If you do not agree with these Terms, do not participate in the Airdrop.</p>

       <p>&nbsp;</p>
       <Typography fontWeight={500}>2. Eligibility</Typography>

       <p>2.1 Age Requirement: Participants must be at least 18 years old or the age of majority in their jurisdiction, whichever is higher.</p>

       <p>2.2 Jurisdiction: The Airdrop is not available to residents or citizens of countries where participation in cryptocurrency activities is restricted or illegal. It is your responsibility that you comply with your local laws.</p>
       <p>2.3 Verification: Participants may be required to undergo identity</p>

       <p>&nbsp;</p>
       <Typography fontWeight={500}>3. Heading</Typography>

       <p>3.1 Age Requirement: Participants must be at least 18 years old or the age of majority in their jurisdiction, whichever is higher.</p>
    </Typography>
  </>);
}
