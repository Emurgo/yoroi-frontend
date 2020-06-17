// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import styles from './ReceiveNavigation.scss';

import AttentionIcon from '../../../assets/images/attention-modern.inline.svg';
import ReceiveNavButton from './ReceiveNavButton';
import type {
  $npm$ReactIntl$IntlFormat,
} from 'react-intl';
import type { AddressTypeName } from '../../../stores/toplevel/AddressesStore';
import { AddressStoreTypes, AddressFilter } from '../../../types/AddressFilterTypes';
import Accordion from '../../widgets/Accordion';
import type { AddressFilterKind } from '../../../types/AddressFilterTypes';
import classNames from 'classnames';
import InfoIcon from '../../../assets/images/attention-big-light.inline.svg';
// import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
// import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';

const messages = defineMessages({
  allLabel: {
    id: 'wallet.receive.navigation.allLabel',
    defaultMessage: '!!!All'
  },
  usedLabel: {
    id: 'wallet.receive.navigation.usedLabel',
    defaultMessage: '!!!Used'
  },
  unusedLabel: {
    id: 'wallet.receive.navigation.unusedLabel',
    defaultMessage: '!!!Unused'
  },
  hasBalanceLabel: {
    id: 'wallet.receive.navigation.hasBalanceLabel',
    defaultMessage: '!!!Has Balance'
  },
  helperInfo: {
    id: 'wallet.receive.navigation.helperInfo',
    defaultMessage: '!!!Here\'s the helper message' ,
  },
});
export type Props = {|
  +setFilter: AddressFilterKind => void,
  +activeFilter: AddressFilterKind,
  +addressTypes: Array<{|
    +isActiveStore: boolean,
    +isHidden: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
  |}>;
  +categoryTitle: string,
|};

@observer
export default class ReceiveNavigation extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const { activeFilter } = this.props;
    const componentClasses = classNames([
      styles.filterButton,
      styles.active,
    ]);
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div>
            <Accordion
              header={
                <div>
                  {this.props.categoryTitle}
                  {/* <Tooltip
                    className={styles.Tooltip}
                    skin={TooltipSkin}
                    tip={intl.formatMessage(messages.helperInfo)}
                  > */}
                  <span className={styles.infoIcon}>
                    <InfoIcon />
                  </span>
                  {/* </Tooltip> */}
                </div>
              }
              activeHeader={this.props.addressTypes.some(address => address.isActiveStore)}
            >
              {this.props.addressTypes.map(type => (
                !type.isHidden && <ReceiveNavButton
                  key={type.name.stable}
                  className={type.name.stable}
                  icon={
                    type.name.stable === AddressStoreTypes.internal ||
                    type.name.stable === AddressStoreTypes.mangled
                      ? AttentionIcon
                      : undefined
                  }
                  label={intl.formatMessage(type.name.display)}
                  isActive={type.isActiveStore}
                  onClick={type.setAsActiveStore}
                />
              ))}
            </Accordion>
          </div>
          {/* Section filtered button */}
          <div className={styles.filterSection}>
            <button
              type="button"
              onClick={() => { this.props.setFilter(AddressFilter.None); }}
              className={activeFilter === AddressFilter.None ?
                componentClasses : styles.filterButton}
            >
              {intl.formatMessage(messages.allLabel)}
            </button>
            <button
              type="button"
              onClick={() => { this.props.setFilter(AddressFilter.Used); }}
              className={activeFilter === AddressFilter.Used ?
                componentClasses : styles.filterButton}
            >
              {intl.formatMessage(messages.usedLabel)}
            </button>
            <button
              type="button"
              onClick={() => { this.props.setFilter(AddressFilter.Unused); }}
              className={activeFilter === AddressFilter.Unused ?
                componentClasses : styles.filterButton}
            >
              {intl.formatMessage(messages.unusedLabel)}
            </button>
            <button
              type="button"
              onClick={() => { this.props.setFilter(AddressFilter.HasBalance); }}
              className={activeFilter === AddressFilter.HasBalance ?
                componentClasses : styles.filterButton}
            >
              {intl.formatMessage(messages.hasBalanceLabel)}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
