// @flow

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import AmountInputSkin from '../skins/AmountInputSkin';
import { NumericInput } from 'react-polymorph/lib/components/NumericInput';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './DelegationTxDialog.scss';
import config from '../../../config';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../widgets/hashWrappers/RawHash';
import type { ExplorerType } from '../../../domain/Explorer';

import {
  DECIMAL_PLACES_IN_ADA,
  MAX_INTEGER_PLACES_IN_ADA
} from '../../../config/numbersConfig';

const messages = defineMessages({
  title: {
    id: 'wallet.delegation.transaction.success.title',
    defaultMessage: '!!!Successfully delegated',
  },
  buttonLabel: {
    id: 'wallet.delegation.transaction.success.explanation',
    defaultMessage: '!!!Dashboard page',
  },
  explanation: {
    id: 'wallet.delegation.transaction.success.explanation',
    defaultMessage: '!!!Track the status of the stake pool and the amount of time remaining to receive a reward from the Dashboard page',
  }
});

type Props = {|
  +onClose: void => void;
  +classicTheme: boolean,
|};

@observer
export default class DelegationSuccessDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    return (
      <Dialog
        title=""
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onClose}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
        classicTheme={this.props.classicTheme}
      >

      </Dialog>
    );
  }
}
