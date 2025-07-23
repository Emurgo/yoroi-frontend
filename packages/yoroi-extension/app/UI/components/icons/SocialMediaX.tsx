import React from 'react';

export const SocialMediaX = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.49233 13.044L2 4H7.93445L12.5594 9.58984L17.5004 4.02517H20.7688L14.1397 11.4998L22 21H16.0833L11.0754 14.9549L5.72896 20.9832H2.44287L9.49233 13.044ZM16.9457 19.3243L5.63881 5.6757H7.07138L18.364 19.3243H16.9457Z" fill={props.fill || "currentColor"}/>
    </svg>
  );
}; 