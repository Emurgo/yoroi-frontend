// @flow
import React, { Component } from 'react';
import type { Node, ElementRef } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './ReceiveNavigation.scss';

import AttentionIcon from '../../../assets/images/attention-modern.inline.svg';
import ReceiveNavButton from './ReceiveNavButton';
import type {
  $npm$ReactIntl$IntlFormat,
} from 'react-intl';
import {
  addressGroupName,
  addressSubgroupName,
  addressGroupsTooltip,
  addressFilter,
  AddressGroupTypes,
  AddressSubgroup,
} from '../../../types/AddressFilterTypes';
import Accordion from '../../widgets/Accordion';
import InfoIcon from '../../../assets/images/attention-big-light.inline.svg';

import type { AddressTypeName, AddressFilterKind } from '../../../types/AddressFilterTypes';
import classNames from 'classnames';
import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';

type AddressStoreSubset = {
    +isActiveStore: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
    +validFilters: $ReadOnlyArray<AddressFilterKind>,
    +wasExecuted: boolean,
    ...,
};
export type Props = {|
  +setFilter: AddressFilterKind => void,
  +activeFilter: AddressFilterKind,
  +addressStores: $ReadOnlyArray<AddressStoreSubset>;
|};

type State = {|
  accordionScrollHeight: null | number,
  groupsToHide: Set<string>,
|};


@observer
export default class ReceiveNavigation extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };
  contentRef: ?ElementRef<*>;
  tooltipIconRefs: Map<string, ElementRef<*>>;

  state: State = {
    accordionScrollHeight: null,
    groupsToHide: new Set(),
  };

  constructor(props: Props) {
    super(props);
    this.tooltipIconRefs = new Map();
    this.contentRef = React.createRef();
  }

  componentDidMount(): void {
    this.resize();
  }

  resize: void => void = () => {
    const { documentElement } = document;
    if (
      !documentElement || !documentElement.style ||
      !this.contentRef
    ) {
      return;
    }
    const current = this.contentRef.current;
    if (current == null) return;

    const groupsToHide = new Set();
    for (const [groupName, tooltipIconWrapper] of this.tooltipIconRefs.entries()) {
      const tooltipIcon = tooltipIconWrapper.children[0];
      const { bottom, top } = tooltipIcon.getBoundingClientRect();
      const insetCutTop = current.getBoundingClientRect().top - top;
      const insetCutBottom = bottom - current.getBoundingClientRect().bottom;

      const infoIconHeight = (bottom - top);

      if (insetCutTop >= infoIconHeight || insetCutBottom >= infoIconHeight) {
        groupsToHide.add(groupName);
      } else {
        // we hide the info icon progressively with the scrollbar
        // ex: if only 50% of the element is visible, this will properly mask 50% of the icon
        tooltipIcon.style.clipPath = `inset(${insetCutTop}px 0% ${insetCutBottom}px 0%)`;
      }
    }

    this.setState({
      accordionScrollHeight: current.scrollTop,
      groupsToHide,
    });
  }

  genTooltip: AddressStoreSubset => Node = (store) => {
    const { intl } = this.context;
    return (
      <Tooltip
        className={classNames([
          styles.Tooltip,
          // if tooltip scrolls out of view, we need to manually hide it
          // note: this is different than hiding the "info" icon
          // since even if the info icon is hidden,
          // hovering it over it still triggers the tooltip unless we hide the tooltip also
          this.state.groupsToHide.has(store.name.group)
            ? styles.hidden
            : null,
        ])}
        style={{
          // need the tooltip to be absolute position in order to appear above other content
          // however, it also needs to properly sync its y position with the scrollbar
          marginTop: `-${this.state.accordionScrollHeight || 0}px`,
        }}
        skin={TooltipSkin}
        tip={intl.formatMessage(addressGroupsTooltip[store.name.group])}
      >
        <span
          className={styles.infoIcon}
          ref={(tooltipIconWrapper) => {
            this.tooltipIconRefs.set(store.name.group, tooltipIconWrapper);
          }}
        >
          <InfoIcon />
        </span>
      </Tooltip>
    );
  }

  createAccordionForGroup: $PropertyType<Props, 'addressStores'> => Node = (stores) => {
    const { intl } = this.context;

    if (stores.length === 1 && stores[0].name.subgroup === AddressSubgroup.all) {
      const store = stores[0];
      return (
        <div className={stores[0].name.group}>
          <ReceiveNavButton
            className={classNames([
              store.name.subgroup,
              store.name.group,
            ])}
            icon={
              stores[0].name.group === AddressGroupTypes.reward
                ? AttentionIcon
                : undefined
            }
            label={intl.formatMessage(addressGroupName[stores[0].name.group])}
            isActive={store.isActiveStore}
            onClick={store.setAsActiveStore}
            isToplevel
            tooltip={this.genTooltip(stores[0])}
          />
        </div>
      );
    }

    return (
      <Accordion
        showSpinner={stores.find(store => !store.wasExecuted) != null}
        header={
          <div>
            {intl.formatMessage(addressGroupName[stores[0].name.group])}
            {this.genTooltip(stores[0])}
          </div>
        }
        activeHeader={stores.some(address => address.isActiveStore)}
      >
        {stores.map(type => (
          <ReceiveNavButton
            key={type.name.subgroup}
            className={classNames([type.name.subgroup, type.name.group])}
            icon={
              type.name.subgroup === AddressSubgroup.internal ||
              type.name.subgroup === AddressSubgroup.mangled
                ? AttentionIcon
                : undefined
            }
            label={intl.formatMessage(addressSubgroupName[type.name.subgroup])}
            isActive={type.isActiveStore}
            onClick={type.setAsActiveStore}
          />
        ))}
      </Accordion>
    );
  }

  createAccordions: void => Node = () => {
    // we use an array instead of a map to maintain the order of stores
    const groups: Array<Array<AddressStoreSubset>> = [];

    for (const store of this.props.addressStores) {
      const existingGroup = groups.find(
        // if any existing group shares the group name
        group => group[0].name.group === store.name.group
      );
      if (existingGroup == null) {
        groups.push([store]);
        continue;
      }
      existingGroup.push(store);
    }

    return groups.map(group => (
      <div
        key={group[0].name.group}
        className={styles.accordion}
      >
        {this.createAccordionForGroup(group)}
      </div>
    ));
  }

  generateFilterSection: void => ?Node = () => {
    const { intl } = this.context;

    const { activeFilter } = this.props;

    const activeStore = this.props.addressStores.find(store => store.isActiveStore);
    if (activeStore == null) return undefined;

    return (
      <div className={styles.filterSection}>
        {activeStore.validFilters.map(filter => (
          <ReceiveNavButton
            key={intl.formatMessage(addressFilter[filter])}
            label={intl.formatMessage(addressFilter[filter])}
            isActive={activeFilter === filter}
            onClick={() => this.props.setFilter(filter)}
            isToplevel
          />
        ))}
      </div>
    );
  }

  render(): Node {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div
            ref={this.contentRef}
            onScroll={this.resize}
            className={styles.accordions}
          >
            {this.createAccordions()}
          </div>
          {/* Section filtered button */}
          {this.generateFilterSection()}
        </div>
      </div>
    );
  }
}
