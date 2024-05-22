// @flow

import type {
  Address, AddressType, Addressing, UsedStatus, Value,
} from '../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { defineMessages } from 'react-intl';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import globalMessages from '../i18n/global-messages';

type Label = {|
  +label: string,
|}

type ToMessage = <K>(K) => $Exact<$npm$ReactIntl$MessageDescriptor>;

export type StandardAddress = {|
  ...Address,
  ...AddressType,
  ...InexactSubset<Label>,
  ...InexactSubset<Value>,
  ...InexactSubset<Addressing>,
  ...InexactSubset<UsedStatus>,
|};

export const AddressSubgroup = Object.freeze({
  all: 'all',
  internal: 'internal',
  external: 'external',
  mangled: 'mangled',
});
type AddressSubgroupKind = $Values<typeof AddressSubgroup>;
export const addressSubgroupName: $ObjMap<typeof AddressSubgroup, ToMessage> = Object.freeze({
  all: globalMessages.allLabel,
  ...defineMessages({
    external: {
      id: 'wallet.receive.nav.external',
      defaultMessage: '!!!External',
    },
    internal: {
      id: 'wallet.receive.nav.internal',
      defaultMessage: '!!!Internal',
    },
    mangled: {
      id: 'wallet.receive.nav.mangled',
      defaultMessage: '!!!Mangled',
    },
  }),
});
export type AddressTypeName = {|
  // constant names that doesn't change with language selected
  group: AddressGroupKind,
  subgroup: AddressSubgroupKind,
|};


export const AddressGroupTypes = Object.freeze({
  base: 'base',
  enterprise: 'enterprise',
  reward: 'reward',
  byron: 'byron',
  addressBook: 'addressBook',
  group: 'group',
});

const commonDescriptions = defineMessages({
  group: {
    id: 'wallet.address.category.group',
    defaultMessage: '!!!Addresses formed by the combination of a spending key and a staking key',
  },
  single: {
    id: 'wallet.address.category.single',
    defaultMessage: '!!!Addresses containing only a spending key and no staking key',
  },
});
type AddressGroupKind = $Values<typeof AddressGroupTypes>;
export const addressGroupsTooltip: $ObjMap<typeof AddressGroupTypes, ToMessage> = Object.freeze({
  group: commonDescriptions.group,
  base: commonDescriptions.group,
  enterprise: commonDescriptions.single,
  ...defineMessages({
    reward: {
      id: 'wallet.address.category.reward',
      defaultMessage: '!!!Address for your staking key',
    },
    byron: {
      id: 'wallet.address.category.byron',
      defaultMessage: '!!!Addresses created using the Byron-era address format',
    },
    addressBook: {
      id: 'wallet.address.category.addressBook',
      defaultMessage: '!!!Addresses that do not belong to you, but are relevant to your wallet',
    },
  })
});
export const addressGroupName: $ObjMap<typeof AddressGroupTypes, ToMessage> = Object.freeze({
  byron: globalMessages.byronLabel,
  ...defineMessages({
    base: {
      id: 'wallet.receive.navigation.baseLabel',
      defaultMessage: '!!!Base'
    },
    enterprise: {
      id: 'wallet.receive.navigation.enterpriseLabel',
      defaultMessage: '!!!Enterprise'
    },
    reward: {
      id: 'wallet.receive.navigation.rewardLabel',
      defaultMessage: '!!!Reward'
    },
    group: {
      id: 'wallet.receive.navigation.groupLabel',
      defaultMessage: '!!!Group'
    },
    addressBook: {
      id: 'wallet.receive.navigation.AddressBook',
      defaultMessage: '!!!Address book'
    },
  })
});


export const AddressFilter = Object.freeze({
  None: 'None',
  Unused: 'Unused',
  Used: 'Used',
  HasBalance: 'HasBalance',
});
export type AddressFilterKind = $Values<typeof AddressFilter>;
export const addressFilter: $ObjMap<typeof AddressFilter, ToMessage> = Object.freeze({
  None: globalMessages.allLabel,
  ...defineMessages({
    Used: {
      id: 'wallet.receive.navigation.usedLabel',
      defaultMessage: '!!!Used'
    },
    Unused: {
      id: 'wallet.receive.navigation.unusedLabel',
      defaultMessage: '!!!Unused'
    },
    HasBalance: {
      id: 'wallet.receive.navigation.hasBalanceLabel',
      defaultMessage: '!!!Has Balance'
    },
  })
});
