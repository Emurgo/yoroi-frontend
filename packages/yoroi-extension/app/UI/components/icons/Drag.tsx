import React from 'react';

export const Drag = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9 3C7.89543 3 7 3.89543 7 5C7 6.10457 7.89543 7 9 7C10.1046 7 11 6.10457 11 5C11 3.89543 10.1046 3 9 3Z" fill={props.fill || "currentColor"} />
      <path d="M14 5C14 3.89543 14.8954 3 16 3C17.1046 3 18 3.89543 18 5C18 6.10457 17.1046 7 16 7C14.8954 7 14 6.10457 14 5Z" fill={props.fill || "currentColor"} />
      <path d="M14 12C14 10.8954 14.8954 10 16 10C17.1046 10 18 10.8954 18 12C18 13.1046 17.1046 14 16 14C14.8954 14 14 13.1046 14 12Z" fill={props.fill || "currentColor"} />
      <path d="M16 17C14.8954 17 14 17.8954 14 19C14 20.1046 14.8954 21 16 21C17.1046 21 18 20.1046 18 19C18 17.8954 17.1046 17 16 17Z" fill={props.fill || "currentColor"} />
      <path d="M7 12C7 10.8954 7.89543 10 9 10C10.1046 10 11 10.8954 11 12C11 13.1046 10.1046 14 9 14C7.89543 14 7 13.1046 7 12Z" fill={props.fill || "currentColor"} />
      <path d="M9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" fill={props.fill || "currentColor"} />
    </svg>
  );
};
