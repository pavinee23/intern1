interface CountryFlagProps {
  country?: 'KR' | 'GB' | 'TH' | 'BN' | 'VN' | 'CN';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function CountryFlag({ country, size = 'md', className = '' }: CountryFlagProps) {
  const sizeMap = {
    sm: { width: 24, height: 16 },
    md: { width: 32, height: 24 },
    lg: { width: 48, height: 36 },
    xl: { width: 64, height: 48 },
  };

  const dimensions = sizeMap[size];

  // Handle undefined country prop
  if (!country) {
    return (
      <div
        className={`inline-block rounded bg-gray-200 ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: '#666'
        }}
      >
        ?
      </div>
    );
  }

  // Thailand Flag - Red, White, Blue horizontal stripes
  if (country === 'TH') {
    return (
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 900 600"
        className={`inline-block rounded ${className}`}
        style={{ display: 'block' }}
      >
        <rect width="900" height="600" fill="#ED1C24" />
        <rect y="100" width="900" height="400" fill="#FFFFFF" />
        <rect y="200" width="900" height="200" fill="#241D4F" />
      </svg>
    );
  }

  // South Korea Flag - Taegukgi
  if (country === 'KR') {
    return (
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 900 600"
        className={`inline-block rounded ${className}`}
        style={{ display: 'block' }}
      >
        {/* White background */}
        <rect width="900" height="600" fill="#FFFFFF" />

        {/* Taeguk (태극) centered at (450,300), radius 150 */}
        <g transform="translate(450, 300)">
          {/* Red top semicircle */}
          <path d="M -150 0 A 150 150 0 0 1 150 0 Z" fill="#CD2E3A" />
          {/* Blue bottom semicircle */}
          <path d="M -150 0 A 150 150 0 0 0 150 0 Z" fill="#003478" />
          {/* Blue circle in upper (red) half → creates S-curve */}
          <circle cx="0" cy="-75" r="75" fill="#003478" />
          {/* Red circle in lower (blue) half → creates S-curve */}
          <circle cx="0" cy="75" r="75" fill="#CD2E3A" />
        </g>

        {/* Four trigrams — bars centered at (0,0), then translate to corner position */}
        {/* Each bar: width=130, height=22, centered on x-axis */}
        {/* 3 bars at y=-36, y=0, y=36  (gap=14 between bars) */}

        {/* NW: 건 Geon ☰ (3 solid bars) — Heaven */}
        <g transform="translate(205, 165) rotate(-56.3)">
          <rect x="-65" y="-47" width="130" height="22" rx="11" fill="#000" />
          <rect x="-65" y="-11" width="130" height="22" rx="11" fill="#000" />
          <rect x="-65"  y="25" width="130" height="22" rx="11" fill="#000" />
        </g>

        {/* NE: 감 Gam ☵ (broken/solid/broken) — Water */}
        <g transform="translate(695, 165) rotate(56.3)">
          <rect x="-65" y="-47" width="54" height="22" rx="11" fill="#000" />
          <rect x="11"  y="-47" width="54" height="22" rx="11" fill="#000" />
          <rect x="-65" y="-11" width="130" height="22" rx="11" fill="#000" />
          <rect x="-65"  y="25" width="54" height="22" rx="11" fill="#000" />
          <rect x="11"   y="25" width="54" height="22" rx="11" fill="#000" />
        </g>

        {/* SW: 리 Ri ☲ (solid/broken/solid) — Fire */}
        <g transform="translate(205, 435) rotate(56.3)">
          <rect x="-65" y="-47" width="130" height="22" rx="11" fill="#000" />
          <rect x="-65" y="-11" width="54" height="22" rx="11" fill="#000" />
          <rect x="11"  y="-11" width="54" height="22" rx="11" fill="#000" />
          <rect x="-65"  y="25" width="130" height="22" rx="11" fill="#000" />
        </g>

        {/* SE: 곤 Gon ☷ (3 broken bars) — Earth */}
        <g transform="translate(695, 435) rotate(-56.3)">
          <rect x="-65" y="-47" width="54" height="22" rx="11" fill="#000" />
          <rect x="11"  y="-47" width="54" height="22" rx="11" fill="#000" />
          <rect x="-65" y="-11" width="54" height="22" rx="11" fill="#000" />
          <rect x="11"  y="-11" width="54" height="22" rx="11" fill="#000" />
          <rect x="-65"  y="25" width="54" height="22" rx="11" fill="#000" />
          <rect x="11"   y="25" width="54" height="22" rx="11" fill="#000" />
        </g>
      </svg>
    );
  }

  // United Kingdom Flag - Union Jack
  if (country === 'GB') {
    return (
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 60 30"
        className={`inline-block rounded ${className}`}
        style={{ display: 'block' }}
      >
        {/* Blue background */}
        <rect width="60" height="30" fill="#012169" />

        {/* White diagonal stripes */}
        <path d="M 0,0 L 60,30 M 60,0 L 0,30" stroke="#FFFFFF" strokeWidth="6" />

        {/* Red diagonal stripes (St Patrick's) */}
        <path d="M 0,0 L 60,30 M 60,0 L 0,30" stroke="#C8102E" strokeWidth="4" />

        {/* White cross (St George's background) */}
        <path d="M 30,0 L 30,30 M 0,15 L 60,15" stroke="#FFFFFF" strokeWidth="10" />

        {/* Red cross (St George's) */}
        <path d="M 30,0 L 30,30 M 0,15 L 60,15" stroke="#C8102E" strokeWidth="6" />
      </svg>
    );
  }

  // For other countries, use external flag service as fallback
  return (
    <img
      src={`https://flagcdn.com/${country.toLowerCase()}.svg`}
      alt={`${country} flag`}
      width={dimensions.width}
      height={dimensions.height}
      className={`inline-block rounded ${className}`}
      style={{ objectFit: 'cover' }}
    />
  );
}
