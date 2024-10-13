// @flow
import type { ComponentType, Node } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/material';
import type { AddressFilterKind, AddressTypeName } from '../../../types/AddressFilterTypes';
import ReceiveNavigationRevamp from '../navigation/ReceiveNavigationRevamp';

export type Props = {|
  +children?: Node,
  +setFilter: AddressFilterKind => void,
  +activeFilter: AddressFilterKind,
  +addressStores: $ReadOnlyArray<{
    +isActiveStore: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
    +validFilters: $ReadOnlyArray<AddressFilterKind>,
    +wasExecuted: boolean,
    ...
  }>,
|};
function ReceiveWithNavigation({ addressStores, setFilter, activeFilter, children }: Props): Node {
  return (
    <Box
      sx={{
        display: 'flex',
        overflow: 'hidden',
        height: '100%',
        bgcolor: 'ds.bg_color_max',
        borderRadius: '8px',
        width: '100%',
      }}
    >
      <Box sx={{
        flexShrink: 0,
        height: '100%'
      }}>
        <ReceiveNavigationRevamp addressStores={addressStores} setFilter={setFilter} activeFilter={activeFilter}/>
      </Box>
      <Box sx={{
        height: '100%',
        minHeight: '200px',
        overflow: 'auto',
        flex: 1
      }}>
        {children}
      </Box>
    </Box>
  );
}
export default (observer(ReceiveWithNavigation): ComponentType<Props>);

ReceiveWithNavigation.defaultProps = {
  children: null,
};
