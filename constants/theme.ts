/**
 * Below are the colors that are used in the app. The app uses light mode only.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  // Text colors
  text: '#11181C',
  textSecondary: '#687076',

  // Background colors
  background: '#fff',
  cardBackground: '#f2f2f7',

  // Brand colors
  tint: '#0a7ea4',

  // UI element colors
  icon: '#687076',
  tabIconDefault: '#687076',
  tabIconSelected: '#0a7ea4',
  border: '#e5e5ea',

  // Semantic colors
  primary: '#007AFF',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',

  // Button colors
  buttonPrimary: '#007AFF',
  buttonPrimaryText: '#fff',
  buttonSecondary: '#f2f2f7',
  buttonSecondaryText: '#007AFF',
  buttonDestructive: '#FF3B30',
  buttonDestructiveText: '#fff',
  buttonSuccess: '#34C759',
  buttonSuccessText: '#fff',
  buttonDisabled: '#e5e5ea',
  buttonDisabledText: '#aeaeb2',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
