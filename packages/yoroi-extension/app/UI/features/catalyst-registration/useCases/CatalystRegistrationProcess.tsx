import { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import type { ReactNode } from 'react';
import { Button } from '@mui/material';
import PubSub from 'pubsub-js';
import { useModal } from '../../../components/modals/ModalContext';
import { PinStep } from '../common/components/registrationSteps/PinStep';
import { ConfirmPinStep } from '../common/components/registrationSteps/ConfirmPinStep';
import { useStrings } from '../common/hooks/useStrings';
import { PasswordStep } from '../common/components/registrationSteps/PasswordStep';
import { TxStep } from '../common/components/registrationSteps/TxStep';
import { QrCodeStep } from '../common/components/registrationSteps/QrCodeStep';
import { TxExecutingStep } from '../common/components/registrationSteps/TxExecutingStep';
import { useVoting, ProgressStep } from '../common/hooks/useVoting';

const modalId = 'catalyst-registration';

export const CatalystRegistrationProcess = () => {
  const { openModal, closeModal } = useModal();
  const { currentVotingStep, resetRegistration, startRegistration, votingPrevStep, votingRegTx } = useVoting();
  const strings = useStrings();

  const title = strings.votingRegistrationTitle;

  useEffect(() => {
    PubSub.subscribe('MODAL_CLOSED', (_: string, closedModalId: string) => {
      if (closedModalId === modalId) resetRegistration();
    });

    return () => {
      PubSub.unsubscribe('MODAL_CLOSED');
    };
  }, []);

  useEffect(() => {
    if (currentVotingStep === -1) {
      closeModal();
      return;
    }

    if (votingRegTx.isExecuting) {
      openModal({
        modalId,
        title,
        content: <TxExecutingStep />,
        width: '648px',
        height: '648px',
      });
      return;
    }

    let content: ReactNode | null = null;

    switch (currentVotingStep) {
      case ProgressStep.GENERATE:
        content = <PinStep />;
        break;
      case ProgressStep.CONFIRM:
        content = <ConfirmPinStep />;
        break;
      case ProgressStep.REGISTER:
        content = <PasswordStep />;
        break;
      case ProgressStep.TRANSACTION:
        content = <TxStep />;
        break;
      case ProgressStep.QR_CODE:
        content = <QrCodeStep closeModal={closeModal} />;
        break;
      default:
        break;
    }

    const hasBack = currentVotingStep === ProgressStep.CONFIRM || currentVotingStep === ProgressStep.TRANSACTION;

    openModal({
      modalId,
      title,
      content,
      handleBack: hasBack ? votingPrevStep : undefined,
      width: '648px',
      height: '648px',
    });
  }, [currentVotingStep, votingRegTx]);

  return (
    <Button
      // @ts-ignore
      variant="primary"
      sx={{
        mx: 'auto',
        width: 'min-content',
        px: '20px !important',
        mt: '24px',
      }}
      onClick={startRegistration}
    >
      {strings.register}
    </Button>
  );
};
