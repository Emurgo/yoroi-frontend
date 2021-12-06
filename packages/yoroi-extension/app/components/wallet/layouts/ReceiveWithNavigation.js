// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { useLayout } from '../../../styles/context/layout';
import type { LayoutComponentMap } from '../../../styles/context/layout';
import ReceiveNavigation from '../navigation/ReceiveNavigation';
import { Box } from '@mui/material';
import type { AddressTypeName, AddressFilterKind } from '../../../types/AddressFilterTypes';

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
type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};
function ReceiveWithNavigation({
  addressStores,
  setFilter,
  activeFilter,
  children,
}: Props & InjectedProps): Node {
  const { renderLayoutComponent } = useLayout();

  const classicReceiveNav = (
    <Box sx={{ display: 'flex', overflow: 'hidden', height: '100%' }}>
      <Box sx={{ flexShrink: 0, height: '100%' }}>
        <ReceiveNavigation
          addressStores={addressStores}
          setFilter={setFilter}
          activeFilter={activeFilter}
        />
      </Box>
      <Box sx={{ height: '100%', minHeight: '200px', overflow: 'overlay', flex: 1 }}>
        {children}
      </Box>
    </Box>
  );

  const revampReceiveNav = (
    <Box
      sx={{
        display: 'flex',
        overflow: 'hidden',
        height: '100%',
        backgroundColor: 'var(--yoroi-palette-common-white)',
        borderRadius: '8px',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          height: '100%',
          '& > div': { backgroundColor: 'var(--yoroi-palette-common-white)' },
        }}
      >
        <ReceiveNavigation
          addressStores={addressStores}
          setFilter={setFilter}
          activeFilter={activeFilter}
        />
      </Box>
      <Box sx={{ height: '100%', minHeight: '200px', overflow: 'overlay', flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
  return renderLayoutComponent({ CLASSIC: classicReceiveNav, REVAMP: revampReceiveNav });
}
export default (observer(ReceiveWithNavigation): ComponentType<Props>);

ReceiveWithNavigation.defaultProps = {
  children: null,
};
