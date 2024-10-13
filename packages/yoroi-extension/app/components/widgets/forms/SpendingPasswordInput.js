// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import PasswordInput from './PasswordInput';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +initValues?: string,
  +isSubmitting: boolean,
|};

@observer
export default class SpendingPasswordInput extends Component<Props> {
  static defaultProps: {| initValues: void |} = {
    initValues: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <PasswordInput
        setForm={this.props.setForm}
        disabled={this.props.isSubmitting}
        passwordMatches={_password => true}
        fieldName="walletPassword"
        validCheck={_password => true}
        placeholder={intl.formatMessage(globalMessages.passwordLabel)}
        allowEmptyInput={false}
        initValues={this.props.initValues}
      />
    );
  }
}
