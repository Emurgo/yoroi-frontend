// @flow

import type {
  Address, Addressing, UsedStatus, Value,
} from '../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { defineMessages } from 'react-intl';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import globalMessages from '../i18n/global-messages';

export type Label = {|
  +label: string,
|}

type ToMessage = <K>(K) => $Exact<$npm$ReactIntl$MessageDescriptor>;

export type StandardAddress = {|
  ...Address,
  ...InexactSubset<Label>, // TODO: remove and change to map
  ...InexactSubset<Value>,
  ...InexactSubset<Addressing>,
  ...InexactSubset<UsedStatus>,
|};

export const AddressStoreTypes = Object.freeze({
  all: 'all',
  internal: 'internal',
  external: 'external',
  mangled: 'mangled',
});
export type AddressStoreKind = $Values<typeof AddressStoreTypes>;
export const addressTypes: $ObjMap<typeof AddressStoreTypes, ToMessage> = Object.freeze({
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
  stable: AddressStoreKind, // constant name that doesn't change with language selected
  display: $Exact<$npm$ReactIntl$MessageDescriptor>,
|};


export const AddressGroupTypes = Object.freeze({
  byron: 'byron',
  addressBook: 'addressBook',
  group: 'group',
  p2pk: 'p2pk',
});
export type AddressGroupKind = $Values<typeof AddressGroupTypes>;
export const addressGroups: $ObjMap<typeof AddressGroupTypes, ToMessage> = defineMessages({
  byron: {
    id: 'wallet.address.category.byron',
    defaultMessage: '!!!Addresses created using the Byron-era address format',
  },
  addressBook: {
    id: 'wallet.address.category.addressBook',
    defaultMessage: '!!!Addresses that do not belong to you, but are relevant to your wallet',
  },
  group: {
    id: 'wallet.address.category.group',
    defaultMessage: '!!!Addresses formed by the combination of a spending key and a staking key',
  },
  p2pk: {
    id: 'wallet.address.category.p2pk',
    defaultMessage: '!!!Addresses generated directly from a public key',
  },
});
export type AddressGroupName = {|
  stable: AddressGroupKind, // constant name that doesn't change with language selected
  display: $Exact<$npm$ReactIntl$MessageDescriptor>,
|};


export const AddressFilter = Object.freeze({
  None: 0,
  Unused: 1,
  Used: 2,
  HasBalance: 3,
});
export type AddressFilterKind = $Values<typeof AddressFilter>;
