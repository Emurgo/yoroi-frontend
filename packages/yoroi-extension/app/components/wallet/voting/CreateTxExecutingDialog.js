// @flow

import { Component } from 'react';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../widgets/Dialog/Dialog';
import AnnotatedLoader from '../../transfer/AnnotatedLoader';

import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
|};

@observer
export default class CreateTxExecutingDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <Dialog
        title={intl.formatMessage(globalMessages.processingLabel)}
        closeOnOverlayClick={false}
      >
        <AnnotatedLoader
          title={intl.formatMessage(globalMessages.processingLabel)}
          details={intl.formatMessage(globalMessages.txGeneration)}
        />
      </Dialog>
    );
  }
}
