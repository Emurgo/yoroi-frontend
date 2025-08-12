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
import {
  getAllocatedAddresses,
  checkClaimForAddress,
  claimForAddress,
  getClaimMessage,
  scanForOriginalDestAddress
} from '../../api/ada/midnight';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { addressHexToBech32 } from '../../api/ada/lib/cardanoCrypto/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { forceNonNull } from '../../coreUtils.js';
import Zero from '../features/airdrop/useCases/Zero';
import ClaimDialog from '../features/airdrop/useCases/ClaimDialog';
import LedgerClaimDialog from '../features/airdrop/useCases/LedgerClaimDialog';
import ClaimContent from '../features/airdrop/useCases/ClaimContent';
import ClaimDone from '../features/airdrop/useCases/ClaimDone';
import LocalStorageApi from '../../api/localStorage';

const localStorageApi = new LocalStorageApi();

type AddressClaimData = {
  addrHex: string;
  addrBech32: string;
  path: Array<number>;
  value: number;
};

interface Props {
  stores: {
    wallets: {
      selectedOrFail: {
        networkId: number;
        publicDeriverId: number;
        type: 'mnemonic' | 'ledger' | 'trezor';
        allAddresses: {
          utxoAddresses: {
            address: {
              Hash: string;
              IsUsed: boolean;
              Type: number;
            };
            // we deal only with base addresses
            path: [number, number, number, number, number];
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
const CHECK_ENDPOINT_MAINNET = 'https://proof.provtree-midnight.com';
const CLAIM_ENDPOINT_MAINNET = 'https://mainnet.prod.gd.midnighttge.io';
const CHECK_ENDPOINT_PREPROD = 'https://proof-staging.provtree-midnight.com';
const CLAIM_ENDPOINT_PREPROD = 'https://preprod.gd.midnighttge.io';

export default function AirdropPage({ stores }: Readonly<Props>) {
  const intl = useIntl();

  // null means querying
  const [alloc, setAlloc] = useState<BigNumber | null>(null);
  const [unclaimedAddrs, setUnclaimedAddrs] = useState<AddressClaimData[]>([]);
  const [isClaimDialog, setIsClaimDialog] = useState(false);
  const [isClaimDone, setIsClaimDone] = useState(false);

  const formattedAlloc = alloc?.div(10 ** NUMBER_OF_NIGHT_DECIMALS).toFormat() ?? '';

  const wallet = stores.wallets.selectedOrFail;
  const isMainnet = wallet.networkId === 0;

  const checkEndpoint = isMainnet ? CHECK_ENDPOINT_MAINNET : CHECK_ENDPOINT_PREPROD;
  const claimEndpoint = isMainnet ? CLAIM_ENDPOINT_MAINNET : CLAIM_ENDPOINT_PREPROD;

  const isTrezor = wallet.type === 'trezor';

  const destAddrBech32 = addressHexToBech32(
    forceNonNull(
      wallet.allAddresses.utxoAddresses.find(a => a.address.Type === CoreAddressTypes.CARDANO_BASE && !a.address.IsUsed)
    ).address.Hash
  );

  const [originalDestAddrBech32, setOriginalDestAddrBech32] = useState('');

  useEffect(() => {
    (async () => {
      const allocatedAddrs: AddressClaimData[] = await getAllocatedAddresses(checkEndpoint, wallet);
      const unclaimedAddrs: AddressClaimData[] = [];
      for (const addr of allocatedAddrs) {
        const claimed = await checkClaimForAddress(claimEndpoint, addr.addrBech32);
        if (!claimed) {
          unclaimedAddrs.push(addr);
        }
      }

      if (allocatedAddrs.length > 0 && unclaimedAddrs.length === 0) {
        setIsClaimDone(true);

        const airdropClaims = await localStorageApi.getAirdropClaimResults();
        const currentWalletClaim = airdropClaims.find(r => r.publicDeriverId === wallet.publicDeriverId);
        if (currentWalletClaim) {
          setOriginalDestAddrBech32(currentWalletClaim.destAddr);
        } else {
          const result = await scanForOriginalDestAddress(
            claimEndpoint,
            destAddrBech32,
            wallet.allAddresses.utxoAddresses.filter(
              a => a.address.Type === CoreAddressTypes.CARDANO_BASE && a.address.IsUsed
            ).sort(
              (addr1, addr2) => addr2.path[4] - addr1.path[4]
            ).map(addr => addressHexToBech32(addr.address.Hash))
          );
          if (result) {
            setOriginalDestAddrBech32(result.destAddr);
            airdropClaims.push({
              publicDeriverId: wallet.publicDeriverId,
              destAddr: result.destAddr,
              claimId: result.claimId,
              amount: result.amount
            });
            await localStorageApi.saveAirdropClaimResults(airdropClaims);
          }
        }
      }
      setAlloc(allocatedAddrs.reduce((accu, addrData) => accu.plus(addrData.value), new BigNumber('0')));
      setUnclaimedAddrs(unclaimedAddrs);
    })();
    return () => {
      // switch wallet
      setAlloc(null);
      setIsClaimDone(false);
      setUnclaimedAddrs([]);
      setOriginalDestAddrBech32('');
      setIsClaimDialog(false);
    };
  }, [wallet.publicDeriverId]);

  const showClaimDialog = async () => {
    setIsClaimDialog(true);
  };

  const closeClaimDialog = async () => {
    setIsClaimDialog(false);
  };

  const claim = async password => {
    const addr = forceNonNull(unclaimedAddrs[0]);
    const claimResult = await claimForAddress(claimEndpoint, wallet, addr, destAddrBech32, password, stores.profile.currentLocale);
    setOriginalDestAddrBech32(destAddrBech32);
    setIsClaimDialog(false);
    setIsClaimDone(true);

    const airdropClaims = await localStorageApi.getAirdropClaimResults();
    airdropClaims.push({
      amount: addr.value,
      claimId: claimResult.claimId,
      publicDeriverId: wallet.publicDeriverId,
      destAddr: destAddrBech32
    });
    await localStorageApi.saveAirdropClaimResults(airdropClaims);
  };

  let content;

  if (!alloc) {
    content = <LoadingSpinner />;
  } else if (alloc.isZero()) {
    content = <Zero />;
  } else if (isClaimDone) {
    content = <ClaimDone alloc={formattedAlloc} destAddrBech32={originalDestAddrBech32} />;
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
