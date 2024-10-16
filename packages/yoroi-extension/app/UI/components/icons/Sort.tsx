import React from 'react';

interface Props {
  id: string;
  order: string | null;
  orderBy: string | null;
  style: any;
  onClick: () => void;
  props?: React.SVGProps<SVGSVGElement>;
}

export const Sort = ({ id, order, orderBy, style, onClick, ...props }: Props) => {
  return (
    <svg style={style} onClick={onClick} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M11.8445 19.2626C11.8998 19.3372 11.9677 19.397 12.0437 19.4379C12.1198 19.4788 12.2022 19.5 12.2856 19.5C12.369 19.5 12.4514 19.4788 12.5274 19.4379C12.6034 19.397 12.6713 19.3372 12.7266 19.2626L16.1352 14.6753C16.4741 14.2204 16.2037 13.5 15.6942 13.5H8.87701C8.36805 13.5 8.09763 14.2204 8.43595 14.676L11.8445 19.2626Z"
        fill={order === 'desc' && orderBy === id ? '#000000' : '#A7AFC0'}
      />
      <path
        d="M11.8445 5.73744C11.8998 5.66279 11.9677 5.60303 12.0437 5.56209C12.1198 5.52116 12.2022 5.5 12.2856 5.5C12.369 5.5 12.4514 5.52116 12.5274 5.56209C12.6034 5.60303 12.6713 5.66279 12.7266 5.73744L16.1352 10.3247C16.4741 10.7796 16.2037 11.5 15.6942 11.5H8.87701C8.36805 11.5 8.09763 10.7796 8.43595 10.324L11.8445 5.73744Z"
        fill={order === 'asc' && orderBy === id ? '#000000' : '#A7AFC0'}
      />
    </svg>
  );
};
