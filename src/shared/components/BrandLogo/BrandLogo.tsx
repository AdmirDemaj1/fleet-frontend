import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { getBrandLogoWithFallback, hasBrandLogo } from '../../utils/brandLogos';

export interface BrandLogoProps extends Omit<BoxProps, 'component'> {
  /** Brand name (e.g., 'BMW', 'Mercedes-Benz', 'Alfa Romeo') */
  brandName: string;
  /** Alt text for the image. If not provided, uses brand name */
  alt?: string;
  /** Size of the logo. Defaults to 40px */
  size?: number | string;
  /** Fallback image URL if brand logo doesn't exist */
  fallback?: string;
  /** Additional props for the img element */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}

/**
 * BrandLogo component for displaying car brand logos
 * Automatically handles fallbacks for missing logos and provides consistent styling
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  brandName,
  alt,
  size = 40,
  fallback,
  imgProps,
  sx,
  ...boxProps
}) => {
  const logoUrl = getBrandLogoWithFallback(brandName, fallback);
  const logoExists = hasBrandLogo(brandName);
  
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        ...sx,
      }}
      {...boxProps}
    >
      <img
        src={logoUrl}
        alt={alt || `${brandName} logo`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          maxWidth: size,
          maxHeight: size,
        }}
        onError={(e) => {
          // Additional fallback if image fails to load
          if (fallback && !logoExists) {
            (e.target as HTMLImageElement).src = '/images/brands/generic-car.png';
          }
          imgProps?.onError?.(e);
        }}
        {...imgProps}
      />
    </Box>
  );
};

export default BrandLogo;