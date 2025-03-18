import React from 'react';

export const Lock = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13C10.8954 13 10 13.8954 10 15C10 16.1046 10.8954 17 12 17Z" fill={props.fill || "currentColor"} />
      <path fillRule="evenodd" clipRule="evenodd" d="M6 9V7C6 4.23858 8.23858 2 11 2C13.7614 2 16 4.23858 16 7V9H18C19.1046 9 20 9.89543 20 11V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V11C4 9.89543 4.89543 9 6 9ZM8 7C8 5.34315 9.34315 4 11 4C12.6569 4 14 5.34315 14 7V9H8V7Z" fill={props.fill || "currentColor"} />
    </svg>
  );
}; 