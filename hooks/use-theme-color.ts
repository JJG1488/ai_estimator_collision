/**
 * Hook to get theme colors. App uses light mode only.
 */

import { Colors } from '@/constants/theme';

export function useThemeColor(
  colorName: keyof typeof Colors
) {
  return Colors[colorName];
}
