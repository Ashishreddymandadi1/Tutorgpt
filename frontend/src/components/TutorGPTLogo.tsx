interface Props {
  size?: number
  showText?: boolean
  textSize?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function TutorGPTLogo({ size = 48, showText = true, textSize = 'md' }: Props) {
  const id = `logo-${size}`
  const textClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }[textSize]

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* Background radial */}
          <radialGradient id={`${id}-bg`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1a0a44" />
            <stop offset="100%" stopColor="#04001a" />
          </radialGradient>

          {/* Ring gradient */}
          <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4da6ff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#a060f8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00c0e8" stopOpacity="0.7" />
          </linearGradient>

          {/* Cap gradient */}
          <linearGradient id={`${id}-cap`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dc4ff" />
            <stop offset="100%" stopColor="#c090ff" />
          </linearGradient>

          {/* Teal accent */}
          <linearGradient id={`${id}-teal`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a060f8" />
            <stop offset="100%" stopColor="#00c0e8" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft glow for outer ring */}
          <filter id={`${id}-ringglow`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow ring */}
        <circle
          cx="28" cy="28" r="26.5"
          stroke={`url(#${id}-ring)`}
          strokeWidth="1.5"
          fill="none"
          filter={`url(#${id}-ringglow)`}
          opacity="0.8"
        />

        {/* Background fill */}
        <circle cx="28" cy="28" r="25" fill={`url(#${id}-bg)`} />

        {/* ── Graduation cap ── */}

        {/* Board top face (flat-top diamond / parallelogram) */}
        <polygon
          points="28,11 43,18.5 28,26 13,18.5"
          fill={`url(#${id}-cap)`}
          filter={`url(#${id}-glow)`}
          opacity="0.95"
        />

        {/* Subtle underside rim */}
        <polygon
          points="28,26 43,18.5 43,20.5 28,28 13,20.5 13,18.5"
          fill="#4da6ff"
          opacity="0.25"
        />

        {/* Center pillar */}
        <rect x="26.5" y="26" width="3" height="9" rx="1.5" fill={`url(#${id}-cap)`} opacity="0.85" />

        {/* Base rim arc */}
        <path
          d="M19 33 Q28 38.5 37 33"
          stroke={`url(#${id}-cap)`}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* ── Tassel (right corner → down) ── */}
        {/* Tassel knot at board corner */}
        <circle cx="43" cy="18.5" r="2.2" fill={`url(#${id}-teal)`} filter={`url(#${id}-glow)`} opacity="0.95" />
        {/* Tassel string */}
        <line
          x1="43" y1="20.7" x2="43" y2="29"
          stroke={`url(#${id}-teal)`}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Tassel tip */}
        <circle cx="43" cy="30.5" r="2" fill="#00c0e8" filter={`url(#${id}-glow)`} opacity="0.9" />

        {/* ── Neural network nodes (scattered) ── */}
        {/* Top-left node */}
        <circle cx="10" cy="13" r="1.8" fill="#4da6ff" opacity="0.7" filter={`url(#${id}-glow)`} />
        {/* Bottom-right node */}
        <circle cx="46" cy="40" r="1.8" fill="#a060f8" opacity="0.65" filter={`url(#${id}-glow)`} />
        {/* Bottom-left node */}
        <circle cx="9" cy="40" r="1.4" fill="#4da6ff" opacity="0.5" />
        {/* Top-right node */}
        <circle cx="47" cy="13" r="1.2" fill="#a060f8" opacity="0.5" />
        {/* Bottom-center node */}
        <circle cx="28" cy="47" r="1.5" fill="#00c0e8" opacity="0.6" filter={`url(#${id}-glow)`} />

        {/* Connection edges */}
        <line x1="10" y1="13" x2="13" y2="18.5" stroke="#4da6ff" strokeWidth="0.6" opacity="0.35" />
        <line x1="47" y1="13" x2="43" y2="18.5" stroke="#a060f8" strokeWidth="0.6" opacity="0.35" />
        <line x1="46" y1="40" x2="43" y2="30.5" stroke="#a060f8" strokeWidth="0.6" opacity="0.3" />
        <line x1="9" y1="40" x2="19" y2="33" stroke="#4da6ff" strokeWidth="0.5" opacity="0.25" />
        <line x1="28" y1="47" x2="28" y2="35" stroke="#00c0e8" strokeWidth="0.5" opacity="0.3" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <div className="leading-none">
          <span
            className={`font-extrabold tracking-tight ${textClasses}`}
            style={{
              background: 'linear-gradient(135deg, #a8d8ff 0%, #d0a8ff 55%, #60e8ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Tutor
            <span
              style={{
                background: 'linear-gradient(135deg, #4da6ff 0%, #a060f8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              GPT
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
