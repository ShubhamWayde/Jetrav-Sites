import * as React from 'react';
import type { SVGProps } from 'react';
const SvgHexagon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path fill="currentColor" d="m12 3 7.794 4.5v9L12 21l-7.794-4.5v-9z" />
  </svg>
);
export default SvgHexagon;
