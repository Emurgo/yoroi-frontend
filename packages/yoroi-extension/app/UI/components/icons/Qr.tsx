import React from 'react';

export const Qr = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3H9V9H3V3ZM5 5V7H7V5H5ZM3 15H9V21H3V15ZM5 17V19H7V17H5ZM15 3H21V9H15V3ZM17 5V7H19V5H17ZM15 15H17V17H15V15ZM19 15H21V17H19V15ZM15 19H17V21H15V19ZM19 19H21V21H19V19Z" fill={props.fill || "currentColor"} />
    </svg>
  );
}; 