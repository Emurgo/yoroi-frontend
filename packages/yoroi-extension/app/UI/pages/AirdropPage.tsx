import { useEffect, useState } from 'react';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import NavBarContainerRevamp from '../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { Box, Typography, Checkbox, FormControlLabel, } from '@mui/material';
import { ReactComponent as ErrorTriangleIcon } from '../../assets/images/revamp/error.triangle.svg';
import BigNumber from 'bignumber.js';
import { getAllocatedAddresses, checkClaimForAddress, claimForAddress, getClaimMessage } from '../../api/ada/midnight';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { addressHexToBech32 } from '../../api/ada/lib/cardanoCrypto/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { LoadingButton } from '@mui/lab';
import { forceNonNull } from '../../coreUtils.js';
import Zero from '../features/airdrop/useCases/Zero';
import Terms from '../features/airdrop/useCases/Terms';
import ClaimDialog from '../features/airdrop/useCases/ClaimDialog';
import LedgerClaimDialog from '../features/airdrop/useCases/LedgerClaimDialog';

const messages = defineMessages({
  size: {
    id: 'airdrop.size',
    defaultMessage: '!!!Your allocation size',
  },
  destinationAddress: {
    id: 'airdrop.destinationAddress',
    defaultMessage: '!!!Your destination address',
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
        allAddresses: {
          utxoAddresses: {
            address: {
              Hash: string,
              IsUsed: boolean,
              Type: number,
            }
          }[],
        },
      },
    },
    profile: {
      currentLocale: string,
    },
  }
}

const NUMBER_OF_NIGHT_DECIMALS = 6;

export default function AirdropPage({ stores }: Props) {
  const intl = useIntl();
  const wallet = stores.wallets.selected;
  if (!wallet) {
    return null;
  }
  const isTrezor = wallet.type === 'trezor';

  // null means querying
  const [alloc, setAlloc] = useState<BigNumber | null>(null);
  const [isTermsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [unclaimedAddrs, setUnclaimedAddrs] = useState<AddressClaimData[]>([]);
  const [isClaimDialog, setClaimDialog] = useState(false);
  const [isClaimDone, setClaimDone] = useState(false);

  const destAddrBech32 = addressHexToBech32(
    forceNonNull(wallet.allAddresses.utxoAddresses.find(a => a.address.Type === CoreAddressTypes.CARDANO_BASE && !a.address.IsUsed)).address.Hash
  );
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
        await claimForAddress(wallet, addr, destAddrBech32, password, stores.profile.currentLocale);
      }
      setClaimDialog(false);
      setClaimDone(true);
    } else { // ledger
      await claimForAddress(wallet, unclaimedAddrs[0], destAddrBech32, password, stores.profile.currentLocale);
    }
  }

  let content;

  if (!alloc) {
    content = (<LoadingSpinner />);
  } else if (alloc.isZero()) {
    content = (<Zero />);
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
                {alloc.div(10 ** NUMBER_OF_NIGHT_DECIMALS).toFormat()} NIGHT
              </Typography>
            </Box>
            {!isTrezor && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <Typography variant="body2" color="ds.text_gray_low">
                  {intl.formatMessage(messages.destinationAddress)}
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {destAddrBech32}
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
              message={getClaimMessage(forceNonNull(unclaimedAddrs[0]).value, destAddrBech32)}
            />
          ) : (
            <LedgerClaimDialog
              onClose={closeClaimDialog}
              onClaim={claim}
              message={getClaimMessage(forceNonNull(unclaimedAddrs[0]).value, destAddrBech32)}
            />
          )
        )}
      </Box>
    </TopBarLayout>
  );
}
