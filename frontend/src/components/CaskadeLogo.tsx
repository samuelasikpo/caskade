export function CaskadeLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="clbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1C1917" />
          <stop offset="100%" stopColor="#0C0A09" />
        </linearGradient>
        <linearGradient id="cla" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="108" fill="url(#clbg)" />
      <path
        d="M 346 149 A 140 140 0 1 0 346 363"
        stroke="url(#cla)"
        strokeWidth="52"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="216" y="192" width="76" height="28" rx="14" fill="url(#cla)" />
      <rect x="234" y="242" width="76" height="28" rx="14" fill="url(#cla)" />
      <rect x="252" y="292" width="76" height="28" rx="14" fill="url(#cla)" />
    </svg>
  );
}
