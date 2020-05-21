// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './ReceiveNavigation.scss';

import AttentionIcon from '../../../assets/images/attention-modern.inline.svg';
import ReceiveNavButton from './ReceiveNavButton';
import type {
  $npm$ReactIntl$IntlFormat,
} from 'react-intl';
import type { AddressTypeName } from '../../../stores/base/AddressesStore';

export type Props = {|
  +addressTypes: Array<{|
    +isActiveStore: boolean,
    +isHidden: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
  |}>;
|};

@observer
export default class ReceiveNavigation extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          {this.props.addressTypes.map(type => (
            !type.isHidden && <ReceiveNavButton
              key={type.name.stable}
              className={type.name.stable}
              icon={type.name.stable === 'internal' || type.name.stable === 'mangled'
                ? AttentionIcon
                : undefined
              }
              label={intl.formatMessage(type.name.display)}
              isActive={type.isActiveStore}
              onClick={type.setAsActiveStore}
            />
          ))}
        </div>
      </div>
    );
  }
}
