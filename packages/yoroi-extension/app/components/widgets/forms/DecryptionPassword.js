// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import PasswordInput from './PasswordInput';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +classicTheme: boolean,
  +initValues?: string,
  +isDisabled: boolean,
  +onChange?: string => void,
|};

const messages = defineMessages({
  decryptionKey: {
    id: 'decryption.label',
    defaultMessage: '!!!Decryption password',
  },
});

@observer
export default class DecryptionPassword extends Component<Props> {

  static defaultProps: {|initValues: void, onChange: void|} = {
    initValues: undefined,
    onChange: undefined,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    return (<PasswordInput
      setForm={this.props.setForm}
      disabled={this.props.isDisabled}
      onChange={this.props.onChange}
      classicTheme={this.props.classicTheme}
      passwordMatches={_password => true}
      fieldName="decryptionPassword"
      validCheck={_password => true}
      placeholder={this.context.intl.formatMessage(messages.decryptionKey)}
      allowEmptyInput
      initValues={this.props.initValues}
      done={/* done if no need for a password */ this.props.isDisabled}
    />);
  }
}
