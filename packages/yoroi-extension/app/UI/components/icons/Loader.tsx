import React from 'react';

export const Loader = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2V6" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 18V22" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.93 4.93L7.76 7.76" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.24 16.24L19.07 19.07" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12H6" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 12H22" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.93 19.07L7.76 16.24" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.24 7.76L19.07 4.93" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}; 