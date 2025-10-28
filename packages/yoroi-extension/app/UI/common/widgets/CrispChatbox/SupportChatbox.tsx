import React from 'react';
import { SUPPORT_CRISP_CHATBOX_URL } from '../../constants';

export const SupportChatbox: React.FC = () => {
  return (
    <iframe
      title="Yoroi Support"
      src={SUPPORT_CRISP_CHATBOX_URL}
      width={680}
      height={840}
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        zIndex: 9998,
      }}
    />
  );
};

