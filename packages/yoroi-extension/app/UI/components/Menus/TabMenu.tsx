import React from 'react';
import { styled } from '@mui/material/styles';
import TabMenuItem from './TabMenuItem';
import { Box } from '@mui/material';

export type SubMenuOption = {
  label: string;
  route: string;
  className: string;
  hidden?: boolean;
};

type Props = {
  isActiveItem: (route: string) => boolean;
  onItemClick: (route: string) => void;
  options: SubMenuOption[];
  locationId: string;
};

const ComponentWrapper = styled(Box)({
  padding: '0 24px',
  width: '100%',
  display: 'flex',
});

const TabMenu: React.FC<Props> = ({ isActiveItem, onItemClick, options, locationId }) => {
  return (
    <ComponentWrapper>
      {options
        .filter(o => !o.hidden)
        .map(({ label, route, className }) => (
          <TabMenuItem
            key={label}
            label={label}
            onClick={() => onItemClick(route)}
            active={isActiveItem(route)}
            className={className}
            locationId={locationId}
          />
        ))}
    </ComponentWrapper>
  );
};

export default TabMenu;
