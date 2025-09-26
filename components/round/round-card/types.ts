import { GetRoundResponseInstance } from '@/lib/api/types';

/**
 * Round card display options
 */
export interface RoundCardDisplayOptions {
  showFullStats?: boolean; // Show enhanced stats grid (enhanced type)
  showActionButton?: boolean; // Show "View Round" action button
  layoutVariant?: 'standard' | 'enhanced';
}

/**
 * Round card props interface
 */
export interface RoundCardProps {
  /**
   * Round data - must conform to GetRoundResponseInstance structure
   */
  round: GetRoundResponseInstance;

  /**
   * Card type - determines default display options and behaviors
   * @default 'standard'
   */
  type?: 'standard' | 'enhanced';

  /**
   * Override default display options
   */
  displayOptions?: Partial<RoundCardDisplayOptions>;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Default display options for different round card types
 */
export function getDefaultRoundDisplayOptions(
  type: 'standard' | 'enhanced',
): RoundCardDisplayOptions {
  const baseOptions: RoundCardDisplayOptions = {
    showFullStats: false,
    showActionButton: true,
    layoutVariant: 'standard',
  };

  switch (type) {
    case 'enhanced':
      return {
        ...baseOptions,
        showFullStats: true,
        layoutVariant: 'enhanced',
      };

    case 'standard':
    default:
      return baseOptions;
  }
}
