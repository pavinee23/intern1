interface CountryFlagProps {
  country?: 'KR' | 'GB' | 'BN' | 'TH' | 'VN' | 'CN';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function CountryFlag({ country, size = 'md', className = '' }: CountryFlagProps) {
  const sizeMap = {
    sm: { width: 20, height: 15 },
    md: { width: 28, height: 21 },
    lg: { width: 40, height: 30 },
    xl: { width: 56, height: 42 },
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
