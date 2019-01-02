// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';

import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';

import ErrorBlock from '../../../widgets/ErrorBlock';

import styles from './ExportTxDialog.scss';

const messages = defineMessages({
});

type Props = {
  isActionProcessing: boolean,
  error: ?LocalizableError,
  submit: Function,
  cancel: Function,
};

@observer
export default class ExportTxDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      isActionProcessing,
      error,
      submit,
      cancel
    } = this.props;

    const introBlock = (<div />);
    const middleBlock = (<div />);

    const dailogActions = [{
      className: isActionProcessing ? styles.processing : null,
      label: 'Export',
      primary: true,
      disabled: false,
      onClick: submit,
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'ExportTxDialog'])}
        title="TEST"
        actions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
      >
        {introBlock}
        {middleBlock}
        <ErrorBlock error={error} />
      </Dialog>);
  }
}
