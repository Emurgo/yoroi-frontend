import React from 'react';

export const Message = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.4087 20 8.88258 19.6756 7.5 19.0858L3 21L4.91421 16.5C4.32442 15.1174 4 13.5913 4 12C4 7.02944 7.80558 3 12.5 3C17.1944 3 21 6.80558 21 11.5Z" fill={props.fill || "currentColor"} />
    </svg>
  );
}; 