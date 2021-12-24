// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classnames from 'classnames'


type Props = {||}
type State = {|
  isChecked: boolean,
  isFocused: boolean,
|}

const messages = defineMessages({
  switcherLabelOn: {
    id: 'connectedWebsites.navbar.switcher.on',
    defaultMessage: '!!!Dapp Connector is on',
  },
  switcherLabelOff: {
    id: 'connectedWebsites.navbar.switcher.off',
    defaultMessage: '!!!Dapp Connector is off',
  },
});


@observer
export default class DappConnectorNavbar extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isFocused: false,
    isChecked: false,
  }

  onFocus: void => void = () => {
    this.setState({ isFocused: true })
  }

  onChange: void => void = () => {
    const { isChecked } = this.state
    this.setState({ isChecked: !isChecked })
  }

  render(): Node {
    const { intl } = this.context;
    const { isFocused, isChecked } = this.state

    return (
      <div className={styles.component}>
        <h1 className={styles.header}>Dapp connector</h1>
        <div className={styles.dappSwitcher}>
          <p className={styles.label}>
            <span>{intl.formatMessage(
              isChecked ? messages.switcherLabelOn : messages.switcherLabelOff
              )}
            </span>
          </p>
          <label
            htmlFor='switcher'
            className={styles.switch}
          >
            <input onChange={this.onChange} type="checkbox" id='switcher' />
            <span className={classnames([
              styles.slider, isFocused && styles.sliderFocus, isChecked && styles.sliderChecked
            ])}
            />
          </label>
        </div>
      </div>
    )
  }
}