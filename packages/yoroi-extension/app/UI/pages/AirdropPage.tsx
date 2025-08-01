import { useEffect, useState } from 'react';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import NavBarContainerRevamp from '../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import { useIntl } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import { getAllocatedAddresses, checkClaimForAddress, claimForAddress, getClaimMessage } from '../../api/ada/midnight';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { addressHexToBech32 } from '../../api/ada/lib/cardanoCrypto/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { forceNonNull } from '../../coreUtils.js';
import Zero from '../features/airdrop/useCases/Zero';
import ClaimDialog from '../features/airdrop/useCases/ClaimDialog';
import LedgerClaimDialog from '../features/airdrop/useCases/LedgerClaimDialog';
import ClaimContent from '../features/airdrop/useCases/ClaimContent';
import ClaimDone from '../features/airdrop/useCases/ClaimDone';

type AddressClaimData = {
  addrHex: string;
  addrBech32: string;
  path: Array<number>;
  value: number;
};

interface Props {
  stores: {
    wallets: {
      selected: null | {
        publicDeriverId: number;
        type: 'mnemonic' | 'ledger' | 'trezor';
        allAddresses: {
          utxoAddresses: {
            address: {
              Hash: string;
              IsUsed: boolean;
              Type: number;
            };
          }[];
        };
      };
    };
    profile: {
      currentLocale: string;
    };
  };
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
  const [unclaimedAddrs, setUnclaimedAddrs] = useState<AddressClaimData[]>([]);
  const [isClaimDialog, setClaimDialog] = useState(false);
  const [isClaimDone, setClaimDone] = useState(false);

  const formattedAlloc = alloc?.div(10 ** NUMBER_OF_NIGHT_DECIMALS).toFormat() ?? '';

  const destAddrBech32 = addressHexToBech32(
    forceNonNull(
      wallet.allAddresses.utxoAddresses.find(a => a.address.Type === CoreAddressTypes.CARDANO_BASE && !a.address.IsUsed)
    ).address.Hash
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
  };

  const closeClaimDialog = async () => {
    setClaimDialog(false);
  };

  const claim = async password => {
    const addr = unclaimedAddrs[0];
    await claimForAddress(wallet, addr, destAddrBech32, password, stores.profile.currentLocale);
    setClaimDialog(false);
    setClaimDone(true);
  };

  let content;

  if (!alloc) {
    content = <LoadingSpinner />;
  } else if (alloc.isZero()) {
    content = <Zero />;
  } else if (isClaimDone) {
    content = <ClaimDone alloc={formattedAlloc} destAddrBech32={destAddrBech32} />;
  } else {
    content = (
      <ClaimContent
        alloc={formattedAlloc}
        isTrezor={isTrezor}
        destAddrBech32={destAddrBech32}
        isClaimDialog={isClaimDialog}
        showClaimDialog={showClaimDialog}
      />
    );
  }
  return (
    <TopBarLayout
      banner={<BannerContainer stores={stores} />}
      sidebar={<SidebarContainer stores={stores} />}
      navbar={
        <NavBarContainerRevamp stores={stores} title={<NavBarTitle title={intl.formatMessage(globalMessages.airdrop)} />} />
      }
      showInContainer
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {content}
        {isClaimDialog &&
          (wallet.type === 'mnemonic' ? (
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
          ))}
      </Box>
    </TopBarLayout>
  );
}
