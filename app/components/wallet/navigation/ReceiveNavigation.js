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
import { addressGroups, addressGroupsTooltip, addressFilter, AddressStoreTypes } from '../../../types/AddressFilterTypes';
import Accordion from '../../widgets/Accordion';
import InfoIcon from '../../../assets/images/attention-big-light.inline.svg';

import type { AddressTypeName, AddressGroupName, AddressFilterKind } from '../../../types/AddressFilterTypes';
import classNames from 'classnames';
import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';

export type Props = {|
  +setFilter: AddressFilterKind => void,
  +activeFilter: AddressFilterKind,
  +addressTypes: Array<{|
    +isActiveStore: boolean,
    +isHidden: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
    +groupName: AddressGroupName,
    +validFilters: Array<AddressFilterKind>,
  |}>;
|};

@observer
export default class ReceiveNavigation extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  createAccordionForGroup: $PropertyType<Props, 'addressTypes'> => Node = (stores) => {
    const { intl } = this.context;

    return (
      <Accordion
        header={
          <div>
            {intl.formatMessage(addressGroups[stores[0].groupName.stable])}
            <Tooltip
              className={styles.Tooltip}
              skin={TooltipSkin}
              tip={intl.formatMessage(addressGroupsTooltip[stores[0].groupName.stable])}
            >
              <span className={styles.infoIcon}>
                <InfoIcon />
              </span>
            </Tooltip>
          </div>
        }
        activeHeader={stores.some(address => address.isActiveStore)}
      >
        {stores.map(type => (
          !type.isHidden && <ReceiveNavButton
            key={type.name.stable}
            className={classNames([type.name.stable, type.groupName.stable])}
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
    );
  }

  createAccordions: void => Node = () => {
    // we use an array instead of a map to maintain the order of stores
    const groups: Array<$PropertyType<Props, 'addressTypes'>> = [];

    for (const store of this.props.addressTypes) {
      const existingGroup = groups.find(
        // if any existing group shares the groupName
        group => group[0].groupName.stable === store.groupName.stable
      );
      if (existingGroup == null) {
        groups.push([store]);
        continue;
      }
      existingGroup.push(store);
    }

    return groups.map(group => (
      <div
        key={group[0].groupName.stable}
        className={styles.accordion}
      >
        {this.createAccordionForGroup(group)}
      </div>
    ));
  }

  generateFilterSection: void => ?Node = () => {
    const { intl } = this.context;

    const { activeFilter } = this.props;
    const componentClasses = classNames([
      styles.filterButton,
      styles.active,
    ]);

    const activeStore = this.props.addressTypes.find(store => store.isActiveStore);
    if (activeStore == null) return undefined;

    return (
      <div className={styles.filterSection}>
        {activeStore.validFilters.map(filter => (
          <button
            key={intl.formatMessage(addressFilter[filter])}
            type="button"
            onClick={() => this.props.setFilter(filter)}
            className={activeFilter === filter
              ? componentClasses
              : styles.filterButton
            }
          >
            {intl.formatMessage(addressFilter[filter])}
          </button>
        ))}
      </div>
    );
  }

  render(): Node {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.accordions}>
            {this.createAccordions()}
          </div>
          {/* Section filtered button */}
          {this.generateFilterSection()}
        </div>
      </div>
    );
  }
}
