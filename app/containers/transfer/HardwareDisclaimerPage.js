// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import HardwareDisclaimer from '../../components/transfer/HardwareDisclaimer';

type Props = {|
  +onBack: void => void,
  +onNext: void => void,
|};

@observer
export default class HardwareDisclaimerPage extends Component<Props> {

  @observable checkboxMarked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    this.checkboxMarked = !this.checkboxMarked;
  }

  render(): Node {
    return (
      <HardwareDisclaimer
        onBack={this.props.onBack}
        onNext={this.props.onNext}
        isChecked={this.checkboxMarked}
        toggleCheck={this.toggleCheck}
      />
    );
  }
}
