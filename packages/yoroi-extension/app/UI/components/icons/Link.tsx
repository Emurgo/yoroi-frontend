import React from 'react';

export const Link = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10 13C10 14.1046 9.10457 15 8 15H6C4.89543 15 4 14.1046 4 13V11C4 9.89543 4.89543 9 6 9H8C9.10457 9 10 9.89543 10 11V13ZM14 11C14 9.89543 14.8954 9 16 9H18C19.1046 9 20 9.89543 20 11V13C20 14.1046 19.1046 15 18 15H16C14.8954 15 14 14.1046 14 13V11ZM8 11H16V13H8V11Z" fill={props.fill || "currentColor"} />
    </svg>
  );
}; 