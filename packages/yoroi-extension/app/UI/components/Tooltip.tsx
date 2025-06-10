import { useTheme } from '@mui/material';
import {
  Tooltip as ReactTooltip,
  type TooltipRefProps as ReactTooltipProps,
  type PositionStrategy,
} from 'react-tooltip';
import { v4 as uuid } from 'uuid';

interface Props
  extends Omit<ReactTooltipProps, 'id' | 'content' | 'offset' | 'open' | 'close' | 'activeAnchor' | 'place' | 'isOpen'> {
  children: JSX.Element;
  title: JSX.Element | string;
  offset?: number;
  open?: ReactTooltipProps['open'];
  close?: ReactTooltipProps['close'];
  activeAnchor?: ReactTooltipProps['activeAnchor'];
  place?: ReactTooltipProps['place'];
  isOpen?: ReactTooltipProps['isOpen'];
  positionStrategy?: PositionStrategy;
}

export const Tooltip = ({
  children,
  title,
  place = 'bottom',
  ...props
}: Props): JSX.Element => {
  const theme: any = useTheme();
  const id = uuid();

  return (
    <span
      {...props}
      data-tooltip-id={id}
      style={{ display: 'inline-flex' }}
    >
      {children}

      <ReactTooltip
        id={id}
        opacity='1'
        style={{
          color: theme.palette.ds.gray_min,
          backgroundColor: theme.palette.ds.gray_900,
          borderRadius: `${theme.shape.borderRadius / 2}px`,
          padding: '5px 12px',
        }}
        arrowColor={theme.palette.ds.gray_900}
        place={place}
        {...props}
      >
        {title}
      </ReactTooltip>
    </span>
  );
};
