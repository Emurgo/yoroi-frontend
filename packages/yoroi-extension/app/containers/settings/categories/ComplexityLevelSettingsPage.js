// @flow

import React from 'react';
import { observer } from 'mobx-react';
import ComplexityLevel from '../../../components/profile/complexity-level/ComplexityLevelForm';
import { useTheme } from '@mui/material';

const ComplexityLevelSettingsPage: any = observer(({ stores, actions }) => {
  const { name } = useTheme();
  return (
    <ComplexityLevel
      complexityLevel={stores.profile.selectedComplexityLevel}
      onSubmit={actions.profile.selectComplexityLevel.trigger}
      isSubmitting={stores.profile.setComplexityLevelRequest.isExecuting}
      error={stores.profile.setComplexityLevelRequest.error}
      baseTheme={name}
    />
  );
});

export default ComplexityLevelSettingsPage;
