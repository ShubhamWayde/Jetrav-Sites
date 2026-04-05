export function SvgGradients() {
  return (
    <svg width="0" height="0" style={{position: 'absolute'}} aria-hidden="true">
      <defs>
        <linearGradient id="jt-primary-gradient" x1="100%" y1="8%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--jt-dark-exact)" />
          <stop offset="100%" stopColor="var(--jt-neutral-800)" />
        </linearGradient>

        <linearGradient id="jt-yellow-gradient" x1="100%" y1="8%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(from var(--jt-yellow-exact)l c h / 0.4)" />
          <stop offset="100%" stopColor="var(--jt-yellow-exact)" />
        </linearGradient>

        <linearGradient id="jt-skyBlue-gradient" x1="100%" y1="8%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(from var(--jt-skyBlue-400)l c h / 0.4)" />
          <stop offset="100%" stopColor="var(--jt-skyBlue-200)" />
        </linearGradient>

        <linearGradient id="jt-secondary-gradient" x1="100%" y1="8%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(from var(--jt-light-exact)l c h / 0.4)" />
          <stop offset="100%" stopColor="var(--jt-light-exact)" />
        </linearGradient>
      </defs>
    </svg>
  );
}