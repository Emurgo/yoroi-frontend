// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import ErrorPage from '../../components/transfer/ErrorPage';
import globalMessages from '../../i18n/global-messages';
import { GenerateTransferTxError } from '../../api/common/errors';

type Props = {|
  +error?: ?LocalizableError,
  +onCancel: void => void,
|};

@observer
export default class YoroiTransferErrorPage extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;
    const { error, onCancel } = this.props;

    return (
      <ErrorPage
        title={intl.formatMessage(new GenerateTransferTxError())}
        backButtonLabel={intl.formatMessage(globalMessages.cancel)}
        onCancel={onCancel}
        error={error}
      />
    );
  }
}
