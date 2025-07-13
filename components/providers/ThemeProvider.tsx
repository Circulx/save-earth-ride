'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Theme Provider Component
 * 
 * This component wraps the entire application to provide dark/light mode functionality.
 * It uses next-themes library for seamless theme switching with system preference detection.
 * 
 * Features:
 * - Automatic system theme detection
 * - Persistent theme preference storage
 * - Smooth transitions between themes
 * - SSR-safe theme switching
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}