// @flow

import { Component } from 'react';
import type { Node } from 'react';
import { genFormatTokenAmount } from '../../../../stores/stateless/tokenHelpers';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { observer } from 'mobx-react';
import { Typography } from '@mui/material';
import type { MultiToken, TokenLookupKey } from '../../../../api/common/lib/MultiToken';
import type { TokenRow, } from '../../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  +fee: ?MultiToken,
  +isCalculatingFee: boolean,
  +totalInput: ?MultiToken,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
|}

export const messages: Object = defineMessages({
    minAda: {
        id: 'wallet.send.form.dialog.minAda',
        defaultMessage: '!!!Min-ADA: {minAda}'
    },
    calculatingMinAda: {
        id: 'wallet.send.form.dialog.calculatingMinAda',
        defaultMessage: '!!!Calculating min ADA...'
    },
});

@observer
export default class MinAda extends Component<Props> {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context;
        const { totalInput, fee, isCalculatingFee } = this.props

        if (isCalculatingFee) {
            return (
              <Typography
                color='var(--yoroi-palette-gray-600)'
                fontSize='14px'
              >
                {intl.formatMessage(messages.calculatingMinAda)}
              </Typography>
            )
        }

        if (!isCalculatingFee && (!totalInput || !fee) ) {
            return (
              <Typography
                color='var(--yoroi-palette-gray-900)'
                fontSize='14px'
              >
                {intl.formatMessage(messages.minAda, { minAda: '0.0' })}
              </Typography>
            )
        }

        if (!fee || !totalInput) return '';
        const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
        const amount = totalInput.joinSubtractCopy(fee);

        return (
          <Typography
            color='var(--yoroi-palatte-gray-900)'
            fontSize='14px'
          >
            {intl.formatMessage(messages.minAda, { minAda: formatValue(amount.getDefaultEntry()) })}
          </Typography>
          )
    }
}