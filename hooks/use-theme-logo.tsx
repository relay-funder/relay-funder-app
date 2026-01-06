import { useTheme } from '@/contexts/ThemeContext';
import Image, { ImageProps } from 'next/image';

// Logo mappings for different themes
const logoMappings = {
  '/relay-funder-logo.svg': {
    light: '/relay-funder-logo.svg',
    dark: '/relay-funder-logo-white.svg',
  },
  '/relay-funder-logo-mark.svg': {
    light: '/relay-funder-logo-mark.svg',
    dark: '/relay-funder-logo-mark.svg',
  },
  '/relay-funder-logo.png': {
    light: '/relay-funder-logo.png',
    dark: '/relay-funder-logo-white.png',
  },
  '/relay-funder-logo-mark.png': {
    light: '/relay-funder-logo-mark.png',
    dark: '/relay-funder-logo-mark-white.png',
  },
} as const;

export function useThemeLogo(logoPath: string): string {
  const { actualTheme } = useTheme();

  // Check if we have a theme-specific mapping for this logo
  const mapping = logoMappings[logoPath as keyof typeof logoMappings];

  if (mapping) {
    return mapping[actualTheme];
  }

  // For logos without specific mappings, return original path
  return logoPath;
}

// Alternative approach: Component that automatically handles theme switching
interface ThemeAwareImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
}

export function ThemeAwareImage({
  src,
  alt,
  className,
  ...props
}: ThemeAwareImageProps) {
  const { actualTheme } = useTheme();
  const themeSrc = useThemeLogo(src);
  const isSVG = themeSrc.endsWith('.svg');

  return (
    <Image
      src={themeSrc}
      alt={alt}
      className={`theme-aware-image ${actualTheme === 'dark' ? 'dark-theme' : 'light-theme'} ${className || ''}`}
      unoptimized={isSVG}
      {...props}
    />
  );
}
