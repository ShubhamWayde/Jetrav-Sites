import * as React from 'react';
import type { SVGProps } from 'react';
const SvgNotifications = (props: SVGProps<SVGSVGElement>) => (
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
      d="M5.25 18.885a.73.73 0 0 1-.534-.216.73.73 0 0 1-.216-.535q0-.318.216-.534a.73.73 0 0 1 .534-.215h1.058V9.923q0-2.017 1.245-3.567a5.52 5.52 0 0 1 3.197-1.983V3.75q0-.52.364-.885Q11.48 2.5 12 2.5t.885.365.366.885v.623a5.52 5.52 0 0 1 3.197 1.983q1.245 1.55 1.245 3.567v7.462h1.058q.318 0 .534.215a.73.73 0 0 1 .216.535q0 .318-.216.534a.73.73 0 0 1-.534.215zm6.748 2.807q-.746 0-1.276-.53a1.74 1.74 0 0 1-.53-1.277h3.616q0 .747-.532 1.277-.531.53-1.278.53m-4.19-4.307h8.384V9.923q0-1.737-1.228-2.964Q13.737 5.73 12 5.73T9.036 6.959Q7.808 8.186 7.808 9.923z"
    />
  </svg>
);
export default SvgNotifications;
