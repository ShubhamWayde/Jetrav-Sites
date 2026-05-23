import * as React from 'react';
import type { SVGProps } from 'react';
const SvgEdit = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M5 19h1.261L16.499 8.764l-1.262-1.262L5 17.739zm-.596 1.5a.87.87 0 0 1-.644-.26.87.87 0 0 1-.26-.644v-1.733q0-.365.14-.697a1.8 1.8 0 0 1 .387-.578L16.691 3.932q.226-.207.5-.319a1.5 1.5 0 0 1 .575-.112q.3 0 .583.107.282.106.499.34l1.221 1.236q.233.217.332.5.099.282.099.565 0 .301-.103.576t-.328.501L7.412 19.973a1.8 1.8 0 0 1-1.275.527zM15.856 8.144l-.62-.642 1.262 1.262z"
    />
  </svg>
);
export default SvgEdit;
