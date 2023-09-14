// @flow
import type { Node } from 'react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { LanguageType } from '../../../i18n/translations';
import type { Theme } from '../../../styles/utils';
import { Component, useState } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import { handleExternalLinkClick } from '../../../utils/routing';
import { THEMES } from '../../../styles/utils';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { ReactComponent as AdaCurrency } from '../../../assets/images/currencies/ADA.inline.svg';
import { unitOfAccountDisabledValue } from '../../../types/unitOfAccountType';
import { trackSetUnitOfAccount, trackSetLocale } from '../../../api/analytics';
import { Box, Button, Input, Typography } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../assets/images/revamp/swap-icon.inline.svg';
import { ReactComponent as RefreshIcon } from '../../../assets/images/revamp/refresh-icon.inline.svg';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/info-icon.inline.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/revamp/edit-icon.inline.svg';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import UnitOfAccountSettings from '../../../components/settings/categories/general-setting/UnitOfAccountSettings';
import LocalizableError from '../../../i18n/LocalizableError';
import SwapInput from '../../../components/swap/SwapInput';
import PriceInput from '../../../components/swap/PriceInput';
import SwapPool from '../../../components/swap/SwapPool';

export default function SwapPage(): Node {
  const [isMarketOrder, setIsMarketOrder] = useState(true);

  return (
    <Box width="100%" mx="auto" maxWidth="506px" display="flex" flexDirection="column" gap="16px">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb="16px">
        <Box sx={{ cursor: 'pointer' }} display="flex" alignItems="center">
          <Box
            onClick={() => setIsMarketOrder(true)}
            p="8px"
            borderRadius="8px"
            bgcolor={isMarketOrder ? 'gray.200' : ''}
          >
            <Typography variant="body1" fontWeight={isMarketOrder ? 500 : 400}>
              Market
            </Typography>
          </Box>
          <Box
            onClick={() => setIsMarketOrder(false)}
            p="8px"
            borderRadius="8px"
            bgcolor={!isMarketOrder ? 'gray.200' : ''}
          >
            <Typography variant="body1" fontWeight={!isMarketOrder ? 500 : 400}>
              Limit
            </Typography>
          </Box>
        </Box>
        <Box sx={{ cursor: 'pointer' }}>
          <RefreshIcon />
        </Box>
      </Box>
      <SwapInput label="Swap from" asset={{ amount: 212, ticker: 'TADA' }} showMax isFrom />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box sx={{ cursor: 'pointer' }}>
          <SwitchIcon />
        </Box>
        <Box>
          <Button variant="tertiary" color="primary">
            Clear
          </Button>
        </Box>
      </Box>
      <SwapInput label="Swap to" asset={{ amount: 0, ticker: 'USDA' }} />
      <Box mt="16px">
        <PriceInput
          assets={[
            { ticker: 'TADA', amount: 20 },
            { ticker: 'USDA', amount: 5 },
          ]}
          readonly={isMarketOrder}
          label="Market price"
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" gap="8px" alignItems="center">
          <Typography variant="body1" color="#8A92A3">
            Slippage tolerance
          </Typography>
          <InfoIcon />
        </Box>
        <Box display="flex" gap="4px" alignItems="center">
          <Typography variant="body1" color="#000">
            1%
          </Typography>
          <EditIcon />
        </Box>
      </Box>
      <Box>
        <SwapPool
          assets={[
            { ticker: 'TADA', amount: 20 },
            { ticker: 'USDA', amount: 5 },
          ]}
        />
      </Box>
    </Box>
  );
}
