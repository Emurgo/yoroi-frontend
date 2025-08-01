import { Typography, Button, Grid, Stack, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import { useModal } from '../modals/ModalContext';
import { useEffect, useRef, useState } from 'react';
import { MidnightIlustration } from './MidnightIlustration';
import LocalStorageApi from '../../../api/localStorage/index';
import { messages } from '../../common/hooks/useStrings';
import { MIDNIGHT_DISTRIBUTION_URL } from '../../common/constants';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';
import { CardIlustration } from './CardIlustration';

export const CardanoCardDialog = () => {
  const intl = useIntl();
  const { openModal, closeModal } = useModal();
  const { data } = useYoroiRemoteConfig();

  useEffect(() => {
    const checkModalState = async () => {
      const localStorage = new LocalStorageApi();
      //   const wasClosed = await localStorage.getMidnightModalClosed();

      openModal({
        title: 'Cardano Card',
        height: '597px',
        width: '650px',
        content: (
          <CardanoCardDialogContent
            onClose={() => {
              localStorage.setMidnightModalClosed(true);
              closeModal();
            }}
          />
        ),
        modalId: 'midnight',
        onClose: () => {
          localStorage.setMidnightModalClosed(true);
        },
      });
    };

    checkModalState();
  }, [data]);
};

const HUBSPOT_FORM_ID = 'hubspotForm';

export const CardanoCardDialogContent = () => {
  const formRef = useRef(null);

  return (
    <Stack>
      <HubSpotForm />
    </Stack>
  );
};

const CustomButton = styled(Button)(() => ({
  width: '100%',
  fontSize: '14px',
}));

export const HubSpotForm = () => {
  const formRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.hsforms.net/forms/embed/v2.js';
    script.async = true;
    script.onload = () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          region: 'na1',
          portalId: '4311174',
          formId: 'fa842eaa-fed6-47f3-b1b4-b1a52d6a0c6b',
          target: formRef.current,
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return <div ref={formRef}></div>;
};
