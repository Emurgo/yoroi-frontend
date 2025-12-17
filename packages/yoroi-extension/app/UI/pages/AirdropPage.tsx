import { Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { scanAddressesForThaws } from '../../api/ada/midnight';
import { type Schedule, getRedeemable, getStatus, getTotal } from '../../api/ada/midnightRedemption';
import TopBarLayout from '../../components/layout/TopBarLayout';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import BannerContainer from '../../containers/banners/BannerContainer';
import NavBarContainerRevamp from '../../containers/NavBarContainerRevamp';
import SidebarContainer from '../../containers/SidebarContainer';
import globalMessages from '../../i18n/global-messages';
//import { addressHexToBech32 } from '../../api/ada/lib/cardanoCrypto/utils';
//import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
//import { forceNonNull } from '../../coreUtils.js';
import { TransactionResult } from '../features/transaction-review/common/types';
import { useTxReviewModal } from '../features/transaction-review/module/ReviewTxProvider';
//import { isCardanoAppNotRunning, isTxCancelledByUser } from '../hwConnect/common/util';
import { isCardanoAppNotRunning, isTxCancelledByUser } from '../../components/wallet/hwConnect/common/util';
import { ModalProvider } from '../components/modals/ModalContext';
import { ModalManager } from '../components/modals/ModalManager';
import { ReviewTxProvider } from '../features/transaction-review/module/ReviewTxProvider';
import { ReviewTxModal } from '../features/transaction-review/useCases/ReviewTx';
//import TextField from '../../components/common/TextField';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { /*broadcastTransaction, */ getProtocolParameters } from '../../api/thunk';
import { AddressCard, AddressesTitle } from '../features/airdrop/useCases/AddressCard';
import AddressDetails from '../features/airdrop/useCases/AddressDetails';
import Redeem from '../features/airdrop/useCases/Redeem';
import Zero from '../features/airdrop/useCases/Zero';

interface ThawData {
  address: string;
  schedule: Schedule;
}

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
        utxos: {
          address: string;
          addressing: any;
          output: {
            Transaction: {
              Hash: string;
            };
            UtxoTransactionOutput: {
              OutputIndex: number;
            };
          };
        }[];
      };
    };
    profile: {
      currentLocale: string;
    };
    transactionProcessingStore: {
      adaSendAndRefresh: (params: { wallet: any, signRequest: any, password: any, callback: any }) => Promise<void>;
    };
  };
}

const THAW_ENDPOINT_MAINNET = 'https://mainnet.prod.gd.midnighttge.io';
const THAW_ENDPOINT_PREPROD = 'https://preprod.gd.midnighttge.io';


function AirdropPage({ stores }: Readonly<Props>) {
  const wallet = stores.wallets.selectedOrFail;

  const [queryingThaws, setQueryingThaws] = useState(true);
  // one element for each redeemable address
  const [addressThawsData, setAddressThawsData] = useState<ThawData[]>([]);

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  // for next stage
  // const [arbitraryAddr, setArbitraryAddr] = useState('');

  const [redeemingAddr, setRedeemingAddr] = useState(null);
  const startRedeem = (addr) => {
    setRedeemingAddr(addr);
  };
  void(startRedeem);

  const closeRedeem = () => {
    setRedeemingAddr(null);
  };

  useEffect(() => {
    let abort = false;
    (async () => {
      const isMainnet = wallet.networkId === 0;
      const thawEndpoint = isMainnet ? THAW_ENDPOINT_MAINNET : THAW_ENDPOINT_PREPROD;
      await scanAddressesForThaws(thawEndpoint, wallet, (data) => {
        if (abort) {
          return false;
        }
        setAddressThawsData(orig => [...orig, data]);
        return true;
      });
      setQueryingThaws(false);
    })();
    return () => {
      // switch wallet
      abort = true;
      setAddressThawsData([]);
      setQueryingThaws(true);
      setSelectedAddressIndex(0);
    };
  }, [wallet.publicDeriverId]);


  const { openTxReviewModal, startLoadingTxReview, showTxResultModal, closeTxReviewModal } = useTxReviewModal();
  const onReorg = async (signRequest: any) => {
    await new Promise<void>((resolve) => {
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
    const senderUtxos: any = [];
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

    await new Promise<void>((resolve) => {
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

  if (!queryingThaws && addressThawsData.length === 0) {
    return (<Zero />);
  }

  const leftPanel = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }} >
      <AddressesTitle count={addressThawsData.length} />
      {addressThawsData.map(({ address, schedule }, index) => (
        <AddressCard
          index={index + 1}
          address={address}
          status={getStatus(schedule)}
          redeemable={getRedeemable(schedule)}
          total={getTotal(schedule)}
          isSelected={index === selectedAddressIndex}
          onSelect={() => { setSelectedAddressIndex(index); }}
        />
      ))}
      {queryingThaws && <LoadingSpinner />}
    </Box>
  );

  const selectedAddressData = addressThawsData[selectedAddressIndex];
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        <Box sx={{ overflowY: 'auto', padding: '24px' }}>
         {leftPanel}
        </Box>
        <Box sx={{ flexGrow: 1, padding: '24px', borderLeft: '1px solid var(--grayscale-200, #DCE0E9)' }}>
          {selectedAddressData && (
            <AddressDetails
              address={selectedAddressData.address}
              schedule={selectedAddressData.schedule}
              redeemableAmount={getRedeemable(selectedAddressData.schedule)}
              networkId={wallet.networkId}
            />
          )}
        </Box>
      </Box>
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
      withPadding={false}
    >
      <ModalProvider>
        <ModalManager />
          <ReviewTxProvider stores={stores}>
            <ReviewTxModal />
            <AirdropPage stores={stores}/>
          </ReviewTxProvider>
      </ModalProvider>
    </TopBarLayout>
  );
}
