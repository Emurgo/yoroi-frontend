// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import React, { Component, } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import TextField from '../../../common/TextField';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './AddTokenDialog.scss';
import config from '../../../../config';
import ExplorableHashContainer from '../../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../../widgets/hashWrappers/RawHash';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../../../utils/unit-of-account';
import WarningBox from '../../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  truncateAddress, truncateToken,
} from '../../../../utils/formatters';
import {
  MultiToken,
} from '../../../../api/common/lib/MultiToken';
import type {
  TokenLookupKey, TokenEntry,
} from '../../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName, genFormatTokenAmount, getTokenStrictName, getTokenIdentifierIfExists, } from '../../../../stores/stateless/tokenHelpers';

type Props = {|
  +onClose: void => void,
  +spendableBalance: ?MultiToken,
|};

@observer
export default class AddTokenDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      walletPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.walletPasswordFieldPlaceholder) : '',
        value: '',
        validators: [({ field }) => {
          if (field.value === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          return [true];
        }],
      },
    }
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  render(): Node {
    const { form } = this;
    const { intl } = this.context;
    const { onClose } = this.props
    const walletPasswordField = form.$('walletPassword');

    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
    const tokenOptions = (() => {
      if (this.props.spendableBalance == null) return [];
      const { spendableBalance } = this.props;
      return [
        ...spendableBalance.nonDefaultEntries(),
      ].map(entry => ({
        entry,
        info: this.props.getTokenInfo(entry),
      })).map(token => {
        const amount = genFormatTokenAmount(this.props.getTokenInfo)(token.entry)
        return {
          value: token.info.TokenId,
          info: token.info,
          label: truncateToken(getTokenStrictName(token.info) ?? getTokenIdentifierIfExists(token.info) ?? '-'),
          id: (getTokenIdentifierIfExists(token.info) ?? '-'),
          amount,
        }
      });
    })();

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        closeOnOverlayClick={false}
        onClose={onClose}
        closeButton={<DialogCloseButton />}
      >
        <div className={styles.component}>
          <div className={styles.tokensList}>
            {
              tokenOptions.map(option => (
                <div className={styles.tokenRow}>
                  <p>{option.label}</p>
                  <p>{option.id}</p>
                  <p>{option.amount}</p>
                </div>
              ))
            }
          </div>
        </div>
      </Dialog>
    );
  }
}
