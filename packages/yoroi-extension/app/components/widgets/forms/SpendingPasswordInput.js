// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import PasswordInput from './PasswordInput';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +classicTheme: boolean,
  +initValues?: string,
  +isSubmitting: boolean,
|};

@observer
export default class SpendingPasswordInput extends Component<Props> {

  static defaultProps: {|initValues: void|} = {
    initValues: undefined,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    return (<PasswordInput
      setForm={this.props.setForm}
      disabled={this.props.isSubmitting}
      classicTheme={this.props.classicTheme}
      passwordMatches={_password => true}
      fieldName="walletPassword"
      validCheck={_password => true}
      placeholder={this.context.intl.formatMessage(globalMessages.walletPasswordLabel)}
      allowEmptyInput={false}
      initValues={this.props.initValues}
    />);
  }
}

