import React from 'react';

export const Pin = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C10.8954 2 10 2.89543 10 4V10H4C2.89543 10 2 10.8954 2 12V14C2 15.1046 2.89543 16 4 16H10V22C10 23.1046 10.8954 24 12 24C13.1046 24 14 23.1046 14 22V16H20C21.1046 16 22 15.1046 22 14V12C22 10.8954 21.1046 10 20 10H14V4C14 2.89543 13.1046 2 12 2Z" fill={props.fill || "currentColor"} />
    </svg>
  );
}; 