// @flow
import type { Node, ComponentType } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import PasswordInput from './PasswordInput';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +initValues?: string,
  +isSubmitting: boolean,
|};

@observer
class SpendingPasswordInput extends Component<Props & InjectedLayoutProps> {
  static defaultProps: {| initValues: void |} = {
    initValues: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { isRevampLayout } = this.props;

    return (
      <PasswordInput
        setForm={this.props.setForm}
        disabled={this.props.isSubmitting}
        passwordMatches={_password => true}
        fieldName="walletPassword"
        validCheck={_password => true}
        placeholder={intl.formatMessage(
          isRevampLayout ? globalMessages.passwordLabel : globalMessages.walletPasswordLabel
        )}
        allowEmptyInput={false}
        initValues={this.props.initValues}
      />
    );
  }
}

export default (withLayout(SpendingPasswordInput): ComponentType<Props>);
