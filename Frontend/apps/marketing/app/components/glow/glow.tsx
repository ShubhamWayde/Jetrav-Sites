import styles from "./glow.module.css";

export default function Glow() {
  return (
    <svg className={styles.glow}
         viewBox="0 0 1920 683"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      // Ensures the SVG scales correctly in layouts
         preserveAspectRatio="xMidYMin slice"
    >
      <g opacity="0.88">
        <ellipse
          cx="960" cy="-260" rx="960" ry="340"
          fill="#A9BAD2" fillOpacity="0.28"
          filter="url(#blur-lg)"
        />
        <circle
          cx="962" cy="-310" r="390"
          fill="#A9BAD2" fillOpacity="0.24"
          filter="url(#blur-md)"
        />
        <circle
          cx="962" cy="-60" r="140"
          fill="#A9BAD2" fillOpacity="0.24"
          filter="url(#blur-sm)"
        />
      </g>
      <defs>
        {/* Simplified filters for better performance */}
        <filter id="blur-lg" x="-700" y="-1300" width="3300" height="2000" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="301" />
        </filter>
        <filter id="blur-md" x="200" y="-1000" width="1500" height="1500" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="140" />
        </filter>
        <filter id="blur-sm" x="600" y="-400" width="700" height="700" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="80" />
        </filter>
      </defs>
    </svg>
  )
}