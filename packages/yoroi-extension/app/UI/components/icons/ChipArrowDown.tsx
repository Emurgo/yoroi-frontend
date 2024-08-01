import React from 'react';

export const ChipArrowDown = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8.35543 10.7599C8.62104 11.0635 9.09326 11.0635 9.35887 10.7599L12.5564 7.10567C12.9335 6.67461 12.6274 6 12.0546 6H5.65966C5.08689 6 4.78077 6.67461 5.15795 7.10567L8.35543 10.7599Z"
        fill={props.fill}
      />
    </svg>
  );
};
