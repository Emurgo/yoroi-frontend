// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { ReactComponent as AttentionIcon } from '../../../assets/images/attention-modern.inline.svg';
import ReceiveNavButtonRevamp from './ReceiveNavButtonRevamp';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  addressGroupName,
  addressSubgroupName,
  addressGroupsTooltip,
  addressFilter,
  AddressGroupTypes,
  AddressSubgroup,
} from '../../../types/AddressFilterTypes';
import Accordion from '../../widgets/Accordion';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/info.inline.svg';

import type { AddressTypeName, AddressFilterKind } from '../../../types/AddressFilterTypes';
import classNames from 'classnames';
import { Box, Tooltip, Typography } from '@mui/material';

type AddressStoreSubset = {
  +isActiveStore: boolean,
  +setAsActiveStore: void => void,
  +name: AddressTypeName,
  +validFilters: $ReadOnlyArray<AddressFilterKind>,
  +wasExecuted: boolean,
  ...
};
export type Props = {|
  +setFilter: AddressFilterKind => void,
  +activeFilter: AddressFilterKind,
  +addressStores: $ReadOnlyArray<AddressStoreSubset>,
|};

@observer
export default class ReceiveNavigationRevamp extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  genTooltip: AddressStoreSubset => Node = store => {
    const { intl } = this.context;
    return (
      <Tooltip
        placement="top-start"
        title={
          <Typography component="div" variant="body3">
            {intl.formatMessage(addressGroupsTooltip[store.name.group])}
          </Typography>
        }
      >
        <div>
          <InfoIcon />
        </div>
      </Tooltip>
    );
  };

  createAccordionForGroup: ($PropertyType<Props, 'addressStores'>) => Node = stores => {
    const { intl } = this.context;

    const store = stores[0];
    if (stores.length === 1 && stores[0].name.subgroup === AddressSubgroup.all) {
      return (
        <Box className={store.name.group}>
          <ReceiveNavButtonRevamp
            className={classNames([store.name.subgroup, store.name.group])}
            icon={store.name.group === AddressGroupTypes.reward ? AttentionIcon : undefined}
            label={intl.formatMessage(addressGroupName[store.name.group])}
            isActive={store.isActiveStore}
            onClick={store.setAsActiveStore}
            isToplevel
            tooltip={this.genTooltip(stores[0])}
          />
        </Box>
      );
    }

    return (
      <Accordion
        style={{ paddingBottom: '24px' }}
        showSpinner={stores.find(str => !str.wasExecuted) != null}
        header={
          <ReceiveNavButtonRevamp
            label={intl.formatMessage(addressGroupName[store.name.group])}
            isActive={stores.some(address => address.isActiveStore)}
            onClick={store.setAsActiveStore}
            tooltip={this.genTooltip(store)}
            noGutters
            isToplevel
          />
        }
        headerStyle={{ paddingBottom: '24px' }}
        activeHeader={stores.some(address => address.isActiveStore)}
      >
        {stores.map(type => (
          <ReceiveNavButtonRevamp
            key={type.name.subgroup}
            className={classNames([type.name.subgroup, type.name.group])}
            icon={
              type.name.subgroup === AddressSubgroup.internal || type.name.subgroup === AddressSubgroup.mangled
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
  };

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

    return groups.map(group => <Box key={group[0].name.group}>{this.createAccordionForGroup(group)}</Box>);
  };

  generateFilterSection: void => ?Node = () => {
    const { intl } = this.context;

    const { activeFilter } = this.props;

    const activeStore = this.props.addressStores.find(store => store.isActiveStore);
    if (activeStore == null) return undefined;

    return (
      activeStore.validFilters.length > 0 && (
        <Box sx={{ pt: '24px', pr: '24px' }}>
          {activeStore.validFilters.map(filter => (
            <ReceiveNavButtonRevamp
              key={intl.formatMessage(addressFilter[filter])}
              label={intl.formatMessage(addressFilter[filter])}
              isActive={activeFilter === filter}
              onClick={() => this.props.setFilter(filter)}
              isToplevel
            />
          ))}
        </Box>
      )
    );
  };

  render(): Node {
    return (
      <Box display="flex" justifyContent="flex-start" minWidth="240px" height="100%" flexDirection="column" paddingBottom="24px">
        <Box
          sx={{
            pt: '14px',
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'grayscale.200',
            borderRadius: '8px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          {this.createAccordions()}
        </Box>
        {/* Section filtered button */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'grayscale.200',
            borderRadius: '8px',
            borderTop: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            height: 'min-content',
            background: 'ds.bg_color_min',
          }}
        >
          {this.generateFilterSection()}
        </Box>
      </Box>
    );
  }
}
