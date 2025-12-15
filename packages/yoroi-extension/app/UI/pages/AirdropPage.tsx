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
import { scanAddressesForThaws, getCollateralUtxos, createReorgTransaction } from '../../api/ada/midnight';
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
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { broadcastTransaction, getProtocolParameters } from '../../api/thunk';

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

interface ThawData {
  address: string;
  schedule: {
    numberOfClaimedAllocations: number;
    thaws: {
      amount: number;
      queue_position: null;
      status: string; // 'upcoming'
      thawing_period_start: string; // "2026-03-03T00:00:00Z"
      transaction_id: null | string;
    }[];
  };
}

const NUMBER_OF_NIGHT_DECIMALS = 6;
const THAW_ENDPOINT_MAINNET = 'https://mainnet.prod.gd.midnighttge.io';
const THAW_ENDPOINT_PREPROD = 'https://preprod.gd.midnighttge.io';


function AirdropPage({ stores }: Readonly<Props>) {
  const intl = useIntl();
  const wallet = stores.wallets.selectedOrFail;

  const [queryingThaws, setQueryingThaws] = useState(true);
  // one element for each redeemable address
  const [addressThawsData, setAddressThawsData] = useState<ThawData>([]);

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
      const thawEndpoint = isMainnet ? THAW_ENDPOINT_MAINNET : THAW_ENDPOINT_PREPROD;
      await scanAddressesForThaws(thawEndpoint, wallet, (data) => {
        setAddressThawsData([...addressThawsData, data]);
      });
      setQueryingThaws(false);
    })();
    return () => {
      // switch wallet
      setAddressThawsData([]);
      setQueryingThaws(true);
    };
  }, [wallet.publicDeriverId]);


  let content;

  content = (
    <div>
      <h1>Redeemable addresses</h1>
      {addressThawsData.map(({ address, schedule }) => (
         <div>
           <div>address: {address}</div>
           <div>schedule:</div>
           <pre>{JSON.stringify(schedule, null, 2)}</pre>
         </div>
      ))}
      {(!queryingThaws && addressThawsData.length === 0) && 'no redeemable address'}
      {queryingThaws && 'scanning...'}
      {/* next stage
      <h1>addresses from other wallets</h1>
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
      */}
    </div>
  );

  const { openTxReviewModal, startLoadingTxReview, showTxResultModal, closeTxReviewModal } = useTxReviewModal();
  const onReorg = async (signRequest: any) => {
    await new Promise((resolve) => {
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
          resolve();
        },
        operations: {
          kind: 'send',
        },
        unsignedTx: signRequest.unsignedTx,
      });
    });
  };

  const onRedeem = async (unsignedTxHex: string) => {
    // todo: validate the transaction
    const protocolParameters = await getProtocolParameters(wallet);
    const tx = RustModule.WalletV4.Transaction.from_hex(unsignedTxHex);
    const senderUtxos = [];
    const inputs = tx.body().inputs();
    for (let i = 0; i < inputs.len(); i++) {
      const input = inputs.get(i);
      for (const utxo of wallet.utxos) {
        if (
          utxo.output.Transaction.Hash === input.transaction_id().to_hex() &&
          utxo.output.UtxoTransactionOutput.OutputIndex === input.index()
        ) {
          senderUtxos.push({
            utxo_id: `${utxo.output.Transaction.Hash}${utxo.output.UtxoTransactionOutput.OutputIndex}`,
            tx_hash: utxo.output.Transaction.Hash,
            tx_index: utxo.output.UtxoTransactionOutput.OutputIndex,
            receiver: utxo.address,
            amount: '0', // not used
            assets: [], // not used
            addressing: utxo.addressing,
          });
          break;
        }
      }
    }
    const signRequest = new HaskellShelleyTxSignRequest({
      senderUtxos,
      // $FlowIgnore: by type definition RustModule.WalletV4.TransactionBuilder is expected here but we can get away with what will actually be used
      unsignedTx: {
        build_tx() {
          return tx;
        },
      },
      changeAddr: [], // no used
      metadata: tx.auxiliary_data(),
      networkSettingSnapshot: {
        ChainNetworkId: 0, // incorrect, but unused
        KeyDeposit: new BigNumber(protocolParameters.keyDeposit),
        PoolDeposit: new BigNumber(protocolParameters.poolDeposit),
        NetworkId: wallet.networkId,
      },
    });

    await new Promise((resolve) => {
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
          resolve();
        },
        operations: {
          kind: 'send',
        },
        unsignedTx: signRequest.unsignedTx,
      });
    });
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>{content}</Box>
      {redeemingAddr && (
        <Redeem
          address={redeemingAddr}
          wallet={wallet}
          onClose={closeRedeem}
          onReorg={onReorg}
          onRedeem={onRedeem}
        />
      )}
    </>
  );
}

export default function AirDropPageWrap({ stores }: Readonly<Props>) {
  const intl = useIntl();

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
            <AirdropPage stores={stores}/>
          </ReviewTxProvider>
      </ModalProvider>
    </TopBarLayout>
  );

}
