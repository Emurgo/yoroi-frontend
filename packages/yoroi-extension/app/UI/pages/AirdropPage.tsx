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
import { checkClaimForAddress, scanForOriginalDestAddress } from '../../api/ada/midnight';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { addressHexToBech32 } from '../../api/ada/lib/cardanoCrypto/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { forceNonNull } from '../../coreUtils.js';
import Zero from '../features/airdrop/useCases/Zero';
import ClaimDone from '../features/airdrop/useCases/ClaimDone';
import LocalStorageApi from '../../api/localStorage';

const localStorageApi = new LocalStorageApi();

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
        name: string;
        plate: unknown;
        allAddressesByType: {
          address: string;
        }[][];
      };
    };
    profile: {
      currentLocale: string;
    };
  };
}

const NUMBER_OF_NIGHT_DECIMALS = 6;
const CLAIM_ENDPOINT_MAINNET = 'https://mainnet.prod.gd.midnighttge.io';
const CLAIM_ENDPOINT_PREPROD = 'https://external-claim.gd.midnighttge.io';

export default function AirdropPage({ stores }: Readonly<Props>) {
  const intl = useIntl();

  // null means querying
  const [alloc, setAlloc] = useState<BigNumber | null>(null);

  const formattedAlloc = alloc?.div(10 ** NUMBER_OF_NIGHT_DECIMALS).toFormat() ?? '';

  const wallet = stores.wallets.selectedOrFail;

  const isMainnet = wallet.networkId === 0;
  const claimEndpoint = isMainnet ? CLAIM_ENDPOINT_MAINNET : CLAIM_ENDPOINT_PREPROD;

  const destAddrBech32 = addressHexToBech32(
    forceNonNull(
      wallet.allAddresses.utxoAddresses.find(a => a.address.Type === CoreAddressTypes.CARDANO_BASE && !a.address.IsUsed)
    ).address.Hash
  );
  const [originalDestAddrBech32, setOriginalDestAddrBech32] = useState('');

  useEffect(() => {
    (async () => {
      const allocatedAddr = addressHexToBech32(
        forceNonNull(wallet.allAddressesByType[CoreAddressTypes.CARDANO_BASE]?.[0]?.address)
      );
      const claimedAmount = await checkClaimForAddress(claimEndpoint, allocatedAddr);
      setAlloc(new BigNumber(claimedAmount));

      const airdropClaims = await localStorageApi.getAirdropClaimResults();
      const currentWalletClaim = airdropClaims.find(r => r.publicDeriverId === wallet.publicDeriverId);
      if (currentWalletClaim) {
        setOriginalDestAddrBech32(currentWalletClaim.destAddr);
      } else {
        const usedAddresses = wallet.allAddresses.utxoAddresses
          .filter(a => a.address.Type === CoreAddressTypes.CARDANO_BASE && a.address.IsUsed)
          .sort((addr1, addr2) => addr2.path[4] - addr1.path[4]);
        const unusedAddresses = wallet.allAddresses.utxoAddresses.filter(
          a => a.address.Type === CoreAddressTypes.CARDANO_BASE && !a.address.IsUsed
        );
        const result = await scanForOriginalDestAddress(
          claimEndpoint,
          destAddrBech32,
          [...usedAddresses, ...unusedAddresses].map(addr => addressHexToBech32(addr.address.Hash))
        );
        if (result && result.success) {
          setOriginalDestAddrBech32(result.destAddr);
          airdropClaims.push({
            publicDeriverId: wallet.publicDeriverId,
            destAddr: result.destAddr,
            claimId: result.claimId,
            amount: result.amount,
          });
          await localStorageApi.saveAirdropClaimResults(airdropClaims);
        } else if (result) {
          setOriginalDestAddrBech32(result.error);
        }
      }
    })();
    return () => {
      // switch wallet
      setAlloc(null);
      setOriginalDestAddrBech32('');
    };
  }, [wallet.publicDeriverId]);

  let content;

  if (!alloc) {
    content = <LoadingSpinner />;
  } else if (alloc.isZero()) {
    content = <Zero />;
  } else {
    content = (
      <ClaimDone
        alloc={formattedAlloc}
        destAddrBech32={originalDestAddrBech32}
        walletPlate={wallet.plate}
        walletName={wallet.name}
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
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>{content}</Box>
    </TopBarLayout>
  );
}
