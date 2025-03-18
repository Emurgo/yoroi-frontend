import React from 'react';

export const BurgerMenu = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6H21" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 18H21" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}; 