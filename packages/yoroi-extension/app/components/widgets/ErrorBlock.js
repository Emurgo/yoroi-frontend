// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import LocalizableError from '../../i18n/LocalizableError';
import { Logger, stringifyError } from '../../utils/logging';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, Typography } from '@mui/material';

type Props = {|
  +error: ?LocalizableError,
|};

@observer
export default class ErrorBlock extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { error } = this.props;

    let errorText = '';
    try {
      errorText = error ? intl.formatMessage(error, error.values) : '';
    } catch (e) {
      Logger.error(`${nameof(ErrorBlock)}:${nameof(this.render)} ${stringifyError(e)}`);
    }

    return (
      <Box mt="10px" textAlign="center">
        <Typography variant="body2" color="ds.text_error">{errorText}</Typography>
      </Box>
    );
  }
}
