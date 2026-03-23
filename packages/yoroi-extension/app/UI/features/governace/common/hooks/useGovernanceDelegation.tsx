import * as React from 'react';
import { NotEnoughMoneyToSendError } from '../../../../../api/common/errors';
import { TransactionResult } from '../../../transaction-review/common/types';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { useStrings } from './useStrings';
import { Vote } from '../../module/state';
import { DREP_ALWAYS_ABSTAIN, DREP_ALWAYS_NO_CONFIDENCE } from '../../common/constants';

type UseGovernanceDelegationResult = {
  loadingUnsignTx: boolean;
  error: string | null;
  setError: (value: string | null) => void;

  // 1) open modal to choose DRep id & delegate
  openDelegateModalForCustomDrep: () => void;

  // 2) always abstain
  delegateToAbstain: () => Promise<void>;

  // 3) always no-confidence
  delegateToNoConfidence: () => Promise<void>;
};

export const useGovernanceDelegation = (): UseGovernanceDelegationResult => {
  const [error, setError] = React.useState<string | null>(null);
  const [loadingUnsignTx, setLoadingUnsignTx] = React.useState<boolean>(false);

  const strings = useStrings();

  const { governanceVoteChanged, createDrepDelegationTransaction, signDelegationTransaction, selectedWallet, governanceManager } =
    useGovernance();

  const {
    openTxReviewModal,
    startLoadingTxReview,
    stopLoadingTxReview,
    changePasswordInputValue,
    showTxResultModal,
    setUnsignedTx,
    drepCredentialHex,
  } = useTxReviewModal();

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

  /** 1) Open modal to choose a custom DRep */
  const openDelegateModalForCustomDrep = React.useCallback(() => {
    if (!governanceManager) {
      return;
    }

    const vote: Vote = { kind: 'delegate', drepID: drepCredentialHex ?? '' };
    governanceVoteChanged(vote);

    openTxReviewModal({
      title: 'CHOOSE YOUR DREP',
      modalView: 'chooseOtherDrepId',
      createUnsignedTx: async (value: string) => {
        try {
          startLoadingTxReview();
          const txSignRequest: any = await createDrepDelegationTransaction(value);
          setUnsignedTx({
            type: 'setUnsignedTx',
            unsignedTx: txSignRequest.signTxRequest.unsignedTx,
          });
        } finally {
          stopLoadingTxReview();
        }
      },
      submitTx: (password: string) => {
        void signGovernanceTx(password);
      },
      operations: {
        kind: 'delegate vote',
      },
    });
  }, [
    governanceManager,
    governanceVoteChanged,
    drepCredentialHex,
    openTxReviewModal,
    startLoadingTxReview,
    stopLoadingTxReview,
    createDrepDelegationTransaction,
    setUnsignedTx,
    signGovernanceTx,
  ]);

  /** 2) Always abstain */
  const delegateToAbstain = React.useCallback(async () => {
    const vote: Vote = { kind: DREP_ALWAYS_ABSTAIN };

    governanceVoteChanged(vote);
    // For abstain / no-confidence we usually just pass the constant to the tx creation
    await createUnsignTx(DREP_ALWAYS_ABSTAIN);
  }, [governanceVoteChanged, createUnsignTx]);

  /** 3) Always no-confidence */
  const delegateToNoConfidence = React.useCallback(async () => {
    const vote: Vote = { kind: DREP_ALWAYS_NO_CONFIDENCE };

    governanceVoteChanged(vote);
    await createUnsignTx(DREP_ALWAYS_NO_CONFIDENCE);
  }, [governanceVoteChanged, createUnsignTx]);

  return {
    loadingUnsignTx,
    error,
    setError,
    openDelegateModalForCustomDrep,
    delegateToAbstain,
    delegateToNoConfidence,
  };
};
