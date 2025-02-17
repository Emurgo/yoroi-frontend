import React from 'react';

export const Wallets = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 2C6.89543 2 6 2.89543 6 4H18C18 2.89543 17.1046 2 16 2H8Z" fill={props.fill || "currentColor"} />
      <path d="M4 7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7H4Z" fill={props.fill || "currentColor"} />
      <path fillRule="evenodd" clipRule="evenodd" d="M5 8C3.34315 8 2 9.34315 2 11V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V11C22 9.34315 20.6569 8 19 8H5ZM19 10H5C4.44772 10 4 10.4477 4 11V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V11C20 10.4477 19.5523 10 19 10Z" fill={props.fill || "currentColor"} />
    </svg>
  );
};
