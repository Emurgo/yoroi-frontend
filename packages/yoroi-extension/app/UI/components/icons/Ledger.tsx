import React from 'react';

export const Ledger = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.2837 3.93168L6.82443 5.80959C5.82801 6.35051 5.48002 7.61069 6.05767 8.58628L13.0699 20.4292C13.5967 21.3189 14.7149 21.6604 15.649 21.2167L19.0472 19.6026C20.1003 19.1024 20.504 17.8112 19.9235 16.8002L12.9724 4.69354C12.4316 3.75176 11.2382 3.41357 10.2837 3.93168Z" fill={props.fill || "currentColor"} />
      <path fillRule="evenodd" clipRule="evenodd" d="M9.5 3C7.01472 3 5 5.01472 5 7.5V20C5 21.1046 5.89543 22 7 22H12C13.1046 22 14 21.1046 14 20V7.5C14 5.01472 11.9853 3 9.5 3ZM9.5 10C10.8807 10 12 8.88071 12 7.5C12 6.11929 10.8807 5 9.5 5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10Z" fill={props.fill || "#C4CAD7"} />
    </svg>
  );
}; 