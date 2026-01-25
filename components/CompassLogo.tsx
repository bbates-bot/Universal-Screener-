/**
 * Compass Logo Component
 * Brand logo for the Compass Student Screener
 */

import React from 'react';

// CGA Brand Colors
export const COMPASS_COLORS = {
  navyDark: '#0D1B52',
  navyMid: '#18307B',
  blueMid: '#2945A3',
  blueLight: '#375acc',
  yellow: '#ffb820',
  yellowDark: '#fda002',
  orange: '#E87205',
  gray: '#b9b9b9',
  grayLight: '#e6e6e6',
  white: '#ffffff',
  black: '#000000',
};

interface CompassLogoProps {
  size?: number;
  variant?: 'primary' | 'white' | 'minimal';
  className?: string;
}

export const CompassLogo: React.FC<CompassLogoProps> = ({
  size = 40,
  variant = 'primary',
  className = '',
}) => {
  const colors = {
    primary: {
      ring: COMPASS_COLORS.navyDark,
      northNeedle: COMPASS_COLORS.yellow,
      southNeedle: COMPASS_COLORS.navyMid,
      eastWestNeedle: COMPASS_COLORS.blueMid,
      centerOuter: COMPASS_COLORS.navyDark,
      centerInner: COMPASS_COLORS.yellow,
    },
    white: {
      ring: COMPASS_COLORS.blueLight,
      northNeedle: COMPASS_COLORS.yellow,
      southNeedle: COMPASS_COLORS.blueLight,
      eastWestNeedle: COMPASS_COLORS.blueLight,
      centerOuter: COMPASS_COLORS.blueLight,
      centerInner: COMPASS_COLORS.yellow,
    },
    minimal: {
      ring: COMPASS_COLORS.navyDark,
      northNeedle: COMPASS_COLORS.yellow,
      southNeedle: COMPASS_COLORS.navyMid,
      eastWestNeedle: COMPASS_COLORS.navyMid,
      centerOuter: COMPASS_COLORS.navyDark,
      centerInner: COMPASS_COLORS.navyDark,
    },
  };

  const c = colors[variant];
  const scale = size / 140;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      className={className}
      aria-label="Compass logo"
    >
      {/* Outer circle */}
      <circle cx="70" cy="70" r="64" stroke={c.ring} strokeWidth="3" />
      {/* Inner decorative circle */}
      <circle cx="70" cy="70" r="52" stroke={c.ring} strokeWidth="1" opacity="0.3" />
      {/* Compass rose base */}
      <circle cx="70" cy="70" r="10" fill={c.centerOuter} />
      <circle cx="70" cy="70" r="5" fill={c.centerInner} />
      {/* North needle - yellow accent */}
      <path d="M70 12 L76 58 L70 48 L64 58 Z" fill={c.northNeedle} />
      {/* South needle */}
      <path d="M70 128 L76 82 L70 92 L64 82 Z" fill={c.southNeedle} />
      {/* East/West needles */}
      <path d="M12 70 L58 64 L48 70 L58 76 Z" fill={c.eastWestNeedle} />
      <path d="M128 70 L82 64 L92 70 L82 76 Z" fill={c.eastWestNeedle} />
    </svg>
  );
};

interface CompassLogoWithTextProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'stacked';
  showTagline?: boolean;
  darkBackground?: boolean;
  className?: string;
}

export const CompassLogoWithText: React.FC<CompassLogoWithTextProps> = ({
  size = 'md',
  variant = 'horizontal',
  showTagline = false,
  darkBackground = false,
  className = '',
}) => {
  const sizes = {
    sm: { logo: 32, title: 'text-lg', tagline: 'text-[10px]' },
    md: { logo: 40, title: 'text-xl', tagline: 'text-xs' },
    lg: { logo: 56, title: 'text-2xl', tagline: 'text-sm' },
  };

  const s = sizes[size];
  const textColor = darkBackground ? COMPASS_COLORS.white : COMPASS_COLORS.navyDark;
  const taglineColor = darkBackground ? COMPASS_COLORS.blueLight : COMPASS_COLORS.blueMid;

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <CompassLogo size={s.logo} variant={darkBackground ? 'white' : 'primary'} />
        <div className="text-center">
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              color: textColor,
              letterSpacing: '0.02em',
            }}
            className={s.title}
          >
            Compass
          </h1>
          {showTagline && (
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: taglineColor,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
              className={`${s.tagline} font-semibold mt-0.5`}
            >
              Student Screener
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CompassLogo size={s.logo} variant={darkBackground ? 'white' : 'primary'} />
      <div>
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            color: textColor,
            letterSpacing: '0.02em',
          }}
          className={`${s.title} font-normal leading-tight`}
        >
          Compass
        </h1>
        {showTagline && (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              color: taglineColor,
            }}
            className={`${s.tagline} font-medium`}
          >
            Pointing you in the right direction
          </p>
        )}
      </div>
    </div>
  );
};

export default CompassLogo;
