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
import { checkClaimForAddress, scanForOriginalDestAddress, getCollateralUtxos, createReorgTransaction } from '../../api/ada/midnight';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { addressHexToBech32 } from '../../api/ada/lib/cardanoCrypto/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { forceNonNull } from '../../coreUtils.js';
import Zero from '../features/airdrop/useCases/Zero';
import ClaimDone from '../features/airdrop/useCases/ClaimDone';
import LocalStorageApi from '../../api/localStorage';
import { useTxReviewModal } from '../features/transaction-review/module/ReviewTxProvider';
import { TransactionResult } from '../features/transaction-review/common/types';
//import { isCardanoAppNotRunning, isTxCancelledByUser } from '../hwConnect/common/util';
import { ModalProvider } from '../components/modals/ModalContext';
import { ModalManager } from '../components/modals/ModalManager';
import { ReviewTxProvider } from '../features/transaction-review/module/ReviewTxProvider';
import { ReviewTxModal } from '../features/transaction-review/useCases/ReviewTx';
import { isCardanoAppNotRunning, isTxCancelledByUser } from '../../components/wallet/hwConnect/common/util';

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
const COLLATERAL_AMOUNT = 2000000;

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
  const [destAddrError, setDestAddrError] = useState('');

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
        if (result.success) {
          setOriginalDestAddrBech32(result.destAddr);
          airdropClaims.push({
            publicDeriverId: wallet.publicDeriverId,
            destAddr: result.destAddr,
            claimId: result.claimId,
            amount: result.amount,
          });
          await localStorageApi.saveAirdropClaimResults(airdropClaims);
        } else {
          setDestAddrError(result.error);
          setOriginalDestAddrBech32('');
        }
      }
    })();
    return () => {
      // switch wallet
      setAlloc(null);
      setOriginalDestAddrBech32('');
      setDestAddrError('');
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
        destAddrError={destAddrError}
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
      <ModalProvider>
        <ModalManager />
          <ReviewTxProvider stores={stores} intl={intl}>
            <ReviewTxModal />
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>{content}</Box>
            <Collateral wallet={wallet} stores={stores} />
          </ReviewTxProvider>
      </ModalProvider>
    </TopBarLayout>
  );
}

function Collateral({ wallet, stores }) {
  const { openTxReviewModal, startLoadingTxReview, showTxResultModal, closeTxReviewModal } = useTxReviewModal();

  const [getCollateralUtxosResult, setGetCollateralUtxosResult] = useState(null);
  useEffect(() => {
    (async () => {
      const getCollateralUtxosResult = await getCollateralUtxos(COLLATERAL_AMOUNT, wallet);
      setGetCollateralUtxosResult(getCollateralUtxosResult);
      const { utxosToUse, reorgTargetAmount } = getCollateralUtxosResult;
      if (reorgTargetAmount) {
        const signRequest = await createReorgTransaction(wallet, reorgTargetAmount);

        openTxReviewModal({
          modalView: 'transactionReview',
          submitTx: async (password) => {
            try {
              startLoadingTxReview();

              await stores.transactionProcessingStore.adaSendAndRefresh({
                wallet,
                signRequest,
                password,
                callback: closeTxReviewModal,
              });
            } catch (error) {
              console.log('Send Sign Error', error);
              let transactionResult;
              if (isTxCancelledByUser(error)) {
                transactionResult = TransactionResult.CANCEL;
              } else if (isCardanoAppNotRunning(error)) {
                transactionResult = TransactionResult.NO_CARDANO_RUNNING;
              } else {
                transactionResult = TransactionResult.FAIL;
              }
              showTxResultModal(transactionResult);
            }
          },
          operations: {
            kind: 'send',
          },
          unsignedTx: signRequest.unsignedTx,
        });
      }
    })().catch(console.error);
  }, [wallet.publicDeriverId]);

  return null;
}
