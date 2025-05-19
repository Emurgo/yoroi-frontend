import React, { useEffect, useState } from 'react';
import { useModal } from '../../../components/modals/ModalContext';
import { PinStep } from '../common/components/PinStep';
import { ConfirmPinStep } from '../common/components/ConfirmPinStep';
import { useStrings } from '../common/hooks/useStrings';
import { Button } from '@mui/material';
import PubSub from 'pubsub-js';
import { PasswordStep } from '../common/components/PasswordStep';
import { TxStep } from '../common/components/TxStep';
import { QrCodeStep } from '../common/components/QrCodeStep';
import { ProgressStep } from '../../../../stores/ada/VotingStore';

const modalId = 'catalyst-registration';

export const CatalystRegistrationProcess = () => {
  const [step, setStep] = useState<number>(-1);
  const { openModal, closeModal } = useModal();
  const strings = useStrings();

  const title = strings.votingRegistrationTitle;

  useEffect(() => {
    PubSub.subscribe('MODAL_CLOSED', (_: string, closedModalId: string) => {
      if (closedModalId === modalId) setStep(-1);
    });

    return () => PubSub.unsubscribe('MODAL_CLOSED');
  }, []);

  useEffect(() => {
    if (step === -1) {
      closeModal();
      return;
    }

    let content: React.ReactNode | null = null;

    if (step === ProgressStep.GENERATE) {
      content = <PinStep handleNextStep={() => setStep(ProgressStep.CONFIRM)} handlePreviousStep={setStep} />;
    } else if (step === ProgressStep.CONFIRM) {
      content = <ConfirmPinStep handleNextStep={() => setStep(ProgressStep.REGISTER)} handlePreviousStep={setStep} />;
    } else if (step === ProgressStep.REGISTER) {
      content = <PasswordStep handleNextStep={() => setStep(ProgressStep.TRANSACTION)} handlePreviousStep={setStep} />;
    } else if (step === ProgressStep.TRANSACTION) {
      content = <TxStep handleNextStep={() => setStep(ProgressStep.QR_CODE)} handlePreviousStep={setStep} />;
    } else if (step === ProgressStep.QR_CODE) {
      content = <QrCodeStep closeModal={closeModal} handlePreviousStep={setStep} />;
    }

    openModal({
      modalId,
      title,
      content,
      handleBack: step > ProgressStep.GENERATE ? () => setStep(prev => prev - 1) : undefined,
    });
  }, [step]);

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
      onClick={() => setStep(ProgressStep.GENERATE)}
    >
      {strings.register}
    </Button>
  );
};
