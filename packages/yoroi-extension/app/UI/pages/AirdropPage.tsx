import { useEffect, useState } from 'react';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import NavBarContainerRevamp from '../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import { useIntl } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { Box, Button } from '@mui/material';
import BigNumber from 'bignumber.js';
import { scanForOriginalDestAddress, scanForMineDestAddress, getCollateralUtxos, createReorgTransaction } from '../../api/ada/midnight';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { addressHexToBech32 } from '../../api/ada/lib/cardanoCrypto/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { forceNonNull } from '../../coreUtils.js';
import { useTxReviewModal } from '../features/transaction-review/module/ReviewTxProvider';
import { TransactionResult } from '../features/transaction-review/common/types';
//import { isCardanoAppNotRunning, isTxCancelledByUser } from '../hwConnect/common/util';
import { ModalProvider } from '../components/modals/ModalContext';
import { ModalManager } from '../components/modals/ModalManager';
import { ReviewTxProvider } from '../features/transaction-review/module/ReviewTxProvider';
import { ReviewTxModal } from '../features/transaction-review/useCases/ReviewTx';
import { isCardanoAppNotRunning, isTxCancelledByUser } from '../../components/wallet/hwConnect/common/util';
import TextField from '../../components/common/TextField';
import Redeem from '../features/airdrop/useCases/Redeem';

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
const THAW_ENDPOINT_MAINNET = '';
const THAW_ENDPOINT_PREPROD = '';
const COLLATERAL_AMOUNT = 2000000;

export default function AirdropPage({ stores }: Readonly<Props>) {
  const intl = useIntl();


  const wallet = stores.wallets.selectedOrFail;

  const [queryingAlloc, setQueryingAlloc] = useState(true);
  const [alloc, setAlloc] = useState(null);

  const [queryingMine, setQueryingMine] = useState(true);
  const [mineDestAddrs, setMineDestAddrs] = useState([]);

  const [arbitraryAddr, setArbitraryAddr] = useState('');

  const [redeemingAddr, setRedeemingAddr] = useState(null);
  const startRedeem = (addr) => {
    setRedeemingAddr(addr);
  };
  const closeRedeem = () => {
    setRedeemingAddr(null);
  };

  useEffect(() => {
    (async () => {
      const isMainnet = wallet.networkId === 0;
      const claimEndpoint = isMainnet ? CLAIM_ENDPOINT_MAINNET : CLAIM_ENDPOINT_PREPROD;
      const result = await scanForOriginalDestAddress(claimEndpoint, wallet);
      setAlloc(result);
      setQueryingAlloc(false);

      const thawEndpoint = isMainnet ? THAW_ENDPOINT_MAINNET : THAW_ENDPOINT_PREPROD;
      const mineAddrs = await scanForMineDestAddress(thawEndpoint, wallet);
      setMineDestAddrs(mineAddrs);
      setQueryingMine(false);
    })();
    return () => {
      // switch wallet
      setAlloc(null);
      setQueryingAlloc(true);
      setMineDestAddrs([]);
      setQueryingMine(true);
    };
  }, [wallet.publicDeriverId]);


  let content;

  content = (
    <div>
      <div>Airdrop allocation</div>
      {queryingAlloc ? '...'
        : alloc ?  (
         <div>
           <div>address: {alloc.address}</div>
           <div>amount: {alloc.amount / 10**6}</div>
           <Button
             variant="outlined"
             onClick={() => { startRedeem(alloc.address); }}
           >
             Claim
           </Button>
         </div>
       ) : 'no allocation'}
      <div>scavenger mine addresses</div>
      {queryingMine ? '...'
        : (mineDestAddrs.length === 0) ? 'no scavenger mine rewards'
        : mineDestAddrs.map(({ address, amount }) => (
           <div>
             <div>address: {address}</div>
             <div>amount: {amount / 10**6}</div>
           </div>
        ))
      }
      <div>addresses from other wallets</div>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
        <TextField
          sx={{ width: '936px' }}
          value={arbitraryAddr}
          label="address"
          onChange={e => { setArbitraryAddr(e.target.value); }}
        />
        <Button
          variant="outlined"
          style={{ height: '48px', marginTop: '12px' }}
          onClick={() => { startRedeem(arbitraryAddr); }}
        >
          Check address
        </Button>
      </Box>
    </div>
  );

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
            {/*<Collateral wallet={wallet} stores={stores} />*/}
            {redeemingAddr && (<Redeem address={redeemingAddr} onClose={closeRedeem} />)}
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
