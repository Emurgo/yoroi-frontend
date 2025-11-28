import * as React from 'react';
import { NotEnoughMoneyToSendError } from '../../../../../api/common/errors';
import { dRepToMaybeCredentialHex } from '../../../../../api/ada/lib/cardanoCrypto/utils';
import { TransactionResult } from '../../../transaction-review/common/types';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { useStrings } from './useStrings';
import { Vote } from '../../module/state';

type UseGovernanceDelegationResult = {
  loadingUnsignTx: boolean;
  error: string | null;
  setError: (value: string | null) => void;
  delegateToDrep: (drepID: string) => Promise<void>;
};

export const useGovernanceDelegationToYoroiDrep = (): UseGovernanceDelegationResult => {
  const [error, setError] = React.useState<string | null>(null);
  const [loadingUnsignTx, setLoadingUnsignTx] = React.useState<boolean>(false);

  const strings = useStrings();

  const { governanceVoteChanged, createDrepDelegationTransaction, signDelegationTransaction, selectedWallet } = useGovernance();

  const { openTxReviewModal, startLoadingTxReview, stopLoadingTxReview, changePasswordInputValue, showTxResultModal, setDrepId } =
    useTxReviewModal();

  const signGovernanceTx = React.useCallback(
    async (password: string) => {
      try {
        startLoadingTxReview();
        await signDelegationTransaction({
          password,
          wallet: selectedWallet,
          dialog: null,
        });
        stopLoadingTxReview();
        changePasswordInputValue({ type: 'changeInputValue', passswordInput: '' });
        showTxResultModal(TransactionResult.SUCCESS);
      } catch (error) {
        console.warn('[createDrepDelegationTransaction,signDelegationTransaction]', error);
        stopLoadingTxReview();
        showTxResultModal(TransactionResult.FAIL);
      }
    },
    [
      startLoadingTxReview,
      stopLoadingTxReview,
      signDelegationTransaction,
      selectedWallet,
      changePasswordInputValue,
      showTxResultModal,
    ]
  );

  const createUnsignTx = React.useCallback(
    async (dRepCredentialHex: string | null) => {
      try {
        setLoadingUnsignTx(true);
        const txSignRequest: any = await createDrepDelegationTransaction(dRepCredentialHex || '');

        openTxReviewModal({
          modalView: 'transactionReview',
          unsignedTx: txSignRequest.signTxRequest.unsignedTx,
          submitTx: (password: string) => {
            void signGovernanceTx(password);
          },
          operations: {
            kind: 'delegate vote',
          },
        });

        setError(null);
      } catch (e) {
        if (e instanceof NotEnoughMoneyToSendError) {
          setError(strings.notEnoughMoneyToSendError);
        } else {
          setError('Error trying to Vote. Please try again later');
        }
      } finally {
        setLoadingUnsignTx(false);
      }
    },
    [createDrepDelegationTransaction, openTxReviewModal, signGovernanceTx, strings]
  );

  const delegateToDrep = React.useCallback(
    async (drepID: string) => {
      const vote: Vote = { kind: 'delegate', drepID };
      const dRepCredentialHex: string | null = dRepToMaybeCredentialHex(drepID);

      governanceVoteChanged(vote);
      setDrepId({ drepID });
      await createUnsignTx(dRepCredentialHex);
    },
    [governanceVoteChanged, setDrepId, createUnsignTx]
  );

  return {
    loadingUnsignTx,
    error,
    setError,
    delegateToDrep,
  };
};
