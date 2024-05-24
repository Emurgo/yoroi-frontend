import { useHistory } from 'react-router-dom';
import React, { useRef } from 'react';

export const useNavigateTo = () => {
  const history = useHistory();

  return React.useRef({
    selectStatus: () => history.push('/gouvernance'),
    delegationForm: () => history.push('/gouvernance/delagation'),
  }).current;
};
