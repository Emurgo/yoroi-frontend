// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import globalMessages from '../../../i18n/global-messages';
import { isValidPaperPassword } from '../../../utils/validations';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import PasswordInput from './PasswordInput';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +passwordMatches: string => boolean,
  +includeLengthCheck: boolean,
  +initValues?: string,
|};

@observer
// <TODO:PENDING_REMOVAL> paper
export default class PaperPasswordInput extends Component<Props> {

  static defaultProps: {|initValues: void|} = {
    initValues: undefined,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    return (<PasswordInput
      setForm={this.props.setForm}
      disabled={false}
      passwordMatches={this.props.passwordMatches}
      fieldName="paperPassword"
      validCheck={password => !this.props.includeLengthCheck || isValidPaperPassword(password)}
      placeholder={this.context.intl.formatMessage(globalMessages.paperPasswordLabel)}
      allowEmptyInput={false}
      initValues={this.props.initValues}
      disclaimer={this.context.intl.formatMessage(globalMessages.passwordDisclaimer)}
    />);
  }
}
