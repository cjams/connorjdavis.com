// Theme configuration - Add your custom themes here
// Each theme should define the complete color palette

export interface ThemeColors {
  // Core semantic colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;

  // Background color scales (0-900)
  background0: string;
  background50: string;
  background100: string;
  background200: string;
  background300: string;
  background400: string;
  background500: string;
  background600: string;
  background700: string;
  background800: string;
  background900: string;

  // Foreground color scales (0-900)
  foreground0: string;
  foreground50: string;
  foreground100: string;
  foreground200: string;
  foreground300: string;
  foreground400: string;
  foreground500: string;
  foreground600: string;
  foreground700: string;
  foreground800: string;
  foreground900: string;

  // Primary color scales (0-900)
  primary0: string;
  primary50: string;
  primary100: string;
  primary200: string;
  primary300: string;
  primary400: string;
  primary500: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;

  // Success color scales (0-900)
  success0: string;
  success50: string;
  success100: string;
  success200: string;
  success300: string;
  success400: string;
  success500: string;
  success600: string;
  success700: string;
  success800: string;
  success900: string;

  // Warning color scales (0-900)
  warning0: string;
  warning50: string;
  warning100: string;
  warning200: string;
  warning300: string;
  warning400: string;
  warning500: string;
  warning600: string;
  warning700: string;
  warning800: string;
  warning900: string;

  // Error color scales (0-900)
  error0: string;
  error50: string;
  error100: string;
  error200: string;
  error300: string;
  error400: string;
  error500: string;
  error600: string;
  error700: string;
  error800: string;
  error900: string;
}

// Light theme
export const lightTheme: ThemeColors = {
  // Core semantic colors
  background: "oklch(1 0 0)",
  foreground: "oklch(0.141 0.005 285.823)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.141 0.005 285.823)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.141 0.005 285.823)",
  primary: "oklch(0.21 0.006 285.885)",
  primaryForeground: "oklch(0.985 0 0)",
  secondary: "oklch(0.967 0.001 286.375)",
  secondaryForeground: "oklch(0.21 0.006 285.885)",
  muted: "oklch(0.967 0.001 286.375)",
  mutedForeground: "oklch(0.552 0.016 285.938)",
  accent: "oklch(0.967 0.001 286.375)",
  accentForeground: "oklch(0.21 0.006 285.885)",
  destructive: "oklch(0.577 0.245 27.325)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.92 0.004 286.32)",
  input: "oklch(0.92 0.004 286.32)",
  ring: "oklch(0.705 0.015 286.067)",

  // Background scales
  background0: "oklch(1 0 0)",
  background50: "oklch(0.985 0 0)",
  background100: "oklch(0.967 0.001 286.375)",
  background200: "oklch(0.95 0.002 286.3)",
  background300: "oklch(0.92 0.004 286.32)",
  background400: "oklch(0.85 0.008 286.25)",
  background500: "oklch(0.75 0.012 286.2)",
  background600: "oklch(0.65 0.016 286.15)",
  background700: "oklch(0.55 0.02 286.1)",
  background800: "oklch(0.35 0.024 286.05)",
  background900: "oklch(0.141 0.005 285.823)",

  // Foreground scales
  foreground0: "oklch(0.141 0.005 285.823)",
  foreground50: "oklch(0.25 0.006 285.8)",
  foreground100: "oklch(0.35 0.008 285.75)",
  foreground200: "oklch(0.45 0.01 285.7)",
  foreground300: "oklch(0.552 0.016 285.938)",
  foreground400: "oklch(0.65 0.018 285.6)",
  foreground500: "oklch(0.75 0.02 285.55)",
  foreground600: "oklch(0.82 0.022 285.5)",
  foreground700: "oklch(0.88 0.024 285.45)",
  foreground800: "oklch(0.94 0.026 285.4)",
  foreground900: "oklch(0.985 0 0)",

  // Primary scales
  primary0: "oklch(0.21 0.006 285.885)",
  primary50: "oklch(0.25 0.008 285.85)",
  primary100: "oklch(0.35 0.012 285.8)",
  primary200: "oklch(0.45 0.016 285.75)",
  primary300: "oklch(0.55 0.02 285.7)",
  primary400: "oklch(0.65 0.024 285.65)",
  primary500: "oklch(0.705 0.015 286.067)",
  primary600: "oklch(0.75 0.028 285.55)",
  primary700: "oklch(0.82 0.032 285.5)",
  primary800: "oklch(0.88 0.036 285.45)",
  primary900: "oklch(0.92 0.004 286.32)",

  // Success scales
  success0: "oklch(0.25 0.08 142)",
  success50: "oklch(0.35 0.1 142)",
  success100: "oklch(0.45 0.12 142)",
  success200: "oklch(0.55 0.14 142)",
  success300: "oklch(0.65 0.16 142)",
  success400: "oklch(0.7 0.18 142)",
  success500: "oklch(0.75 0.2 142)",
  success600: "oklch(0.8 0.18 142)",
  success700: "oklch(0.85 0.16 142)",
  success800: "oklch(0.9 0.14 142)",
  success900: "oklch(0.95 0.12 142)",

  // Warning scales
  warning0: "oklch(0.35 0.12 65)",
  warning50: "oklch(0.45 0.14 65)",
  warning100: "oklch(0.55 0.16 65)",
  warning200: "oklch(0.65 0.18 65)",
  warning300: "oklch(0.7 0.2 65)",
  warning400: "oklch(0.75 0.22 65)",
  warning500: "oklch(0.8 0.24 65)",
  warning600: "oklch(0.82 0.22 65)",
  warning700: "oklch(0.84 0.2 65)",
  warning800: "oklch(0.86 0.18 65)",
  warning900: "oklch(0.88 0.16 65)",

  // Error scales
  error0: "oklch(0.35 0.15 27)",
  error50: "oklch(0.45 0.17 27)",
  error100: "oklch(0.5 0.19 27)",
  error200: "oklch(0.55 0.21 27)",
  error300: "oklch(0.577 0.245 27.325)",
  error400: "oklch(0.62 0.25 27)",
  error500: "oklch(0.67 0.27 27)",
  error600: "oklch(0.72 0.25 27)",
  error700: "oklch(0.77 0.23 27)",
  error800: "oklch(0.82 0.21 27)",
  error900: "oklch(0.87 0.19 27)",
};

// Dark theme
export const darkTheme: ThemeColors = {
  // Core semantic colors
  background: "oklch(0.141 0.005 285.823)",
  foreground: "oklch(0.985 0 0)",
  card: "oklch(0.21 0.006 285.885)",
  cardForeground: "oklch(0.985 0 0)",
  popover: "oklch(0.21 0.006 285.885)",
  popoverForeground: "oklch(0.985 0 0)",
  primary: "oklch(0.705 0.213 47.604)",
  primaryForeground: "oklch(0.21 0.006 285.885)",
  secondary: "oklch(0.274 0.006 286.033)",
  secondaryForeground: "oklch(0.985 0 0)",
  muted: "oklch(0.274 0.006 286.033)",
  mutedForeground: "oklch(0.705 0.015 286.067)",
  accent: "oklch(0.274 0.006 286.033)",
  accentForeground: "oklch(0.985 0 0)",
  destructive: "oklch(0.704 0.191 22.216)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(1 0 0 / 10%)",
  input: "oklch(1 0 0 / 15%)",
  ring: "oklch(0.705 0.213 47.604)",

  // Background scales
  background0: "oklch(0.141 0.005 285.823)",
  background50: "oklch(0.18 0.006 285.8)",
  background100: "oklch(0.21 0.006 285.885)",
  background200: "oklch(0.274 0.006 286.033)",
  background300: "oklch(0.32 0.007 285.9)",
  background400: "oklch(0.38 0.008 285.85)",
  background500: "oklch(0.45 0.01 285.8)",
  background600: "oklch(0.552 0.016 285.938)",
  background700: "oklch(0.65 0.018 285.7)",
  background800: "oklch(0.75 0.02 285.65)",
  background900: "oklch(0.985 0 0)",

  // Foreground scales
  foreground0: "oklch(0.985 0 0)",
  foreground50: "oklch(0.95 0.001 285.4)",
  foreground100: "oklch(0.92 0.004 286.32)",
  foreground200: "oklch(0.88 0.006 285.6)",
  foreground300: "oklch(0.82 0.008 285.55)",
  foreground400: "oklch(0.75 0.012 285.5)",
  foreground500: "oklch(0.705 0.015 286.067)",
  foreground600: "oklch(0.65 0.016 285.4)",
  foreground700: "oklch(0.55 0.014 285.35)",
  foreground800: "oklch(0.45 0.012 285.3)",
  foreground900: "oklch(0.141 0.005 285.823)",

  // Primary scales (Tailwind Orange)
  primary0: "oklch(0.266 0.079 36.259)", // orange-950
  primary50: "oklch(0.98 0.016 73.684)", // orange-50
  primary100: "oklch(0.954 0.038 75.164)", // orange-100
  primary200: "oklch(0.901 0.076 70.697)", // orange-200
  primary300: "oklch(0.837 0.128 66.29)", // orange-300
  primary400: "oklch(0.75 0.183 55.934)", // orange-400
  primary500: "oklch(0.705 0.213 47.604)", // orange-500
  primary600: "oklch(0.646 0.222 41.116)", // orange-600
  primary700: "oklch(0.553 0.195 38.402)", // orange-700
  primary800: "oklch(0.47 0.157 37.304)", // orange-800
  primary900: "oklch(0.408 0.123 38.172)", // orange-900

  // Success scales
  success0: "oklch(0.8 0.16 142)",
  success50: "oklch(0.75 0.18 142)",
  success100: "oklch(0.7 0.2 142)",
  success200: "oklch(0.65 0.18 142)",
  success300: "oklch(0.6 0.16 142)",
  success400: "oklch(0.55 0.14 142)",
  success500: "oklch(0.5 0.12 142)",
  success600: "oklch(0.45 0.1 142)",
  success700: "oklch(0.4 0.08 142)",
  success800: "oklch(0.35 0.06 142)",
  success900: "oklch(0.25 0.04 142)",

  // Warning scales
  warning0: "oklch(0.85 0.2 65)",
  warning50: "oklch(0.8 0.22 65)",
  warning100: "oklch(0.75 0.24 65)",
  warning200: "oklch(0.7 0.22 65)",
  warning300: "oklch(0.65 0.2 65)",
  warning400: "oklch(0.6 0.18 65)",
  warning500: "oklch(0.55 0.16 65)",
  warning600: "oklch(0.5 0.14 65)",
  warning700: "oklch(0.45 0.12 65)",
  warning800: "oklch(0.4 0.1 65)",
  warning900: "oklch(0.35 0.08 65)",

  // Error scales
  error0: "oklch(0.8 0.25 22)",
  error50: "oklch(0.75 0.23 22)",
  error100: "oklch(0.704 0.191 22.216)",
  error200: "oklch(0.65 0.2 22)",
  error300: "oklch(0.6 0.19 22)",
  error400: "oklch(0.55 0.18 22)",
  error500: "oklch(0.5 0.17 22)",
  error600: "oklch(0.45 0.16 22)",
  error700: "oklch(0.4 0.15 22)",
  error800: "oklch(0.35 0.14 22)",
  error900: "oklch(0.3 0.13 22)",
};

// Ocean Blue theme
export const oceanTheme: ThemeColors = {
  // Core semantic colors
  background: "oklch(0.98 0.002 240)",
  foreground: "oklch(0.15 0.01 240)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.15 0.01 240)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.15 0.01 240)",
  primary: "oklch(0.45 0.18 240)",
  primaryForeground: "oklch(0.98 0.002 240)",
  secondary: "oklch(0.95 0.01 240)",
  secondaryForeground: "oklch(0.25 0.01 240)",
  muted: "oklch(0.95 0.01 240)",
  mutedForeground: "oklch(0.5 0.01 240)",
  accent: "oklch(0.92 0.02 240)",
  accentForeground: "oklch(0.25 0.01 240)",
  destructive: "oklch(0.6 0.2 20)",
  destructiveForeground: "oklch(0.98 0.002 240)",
  border: "oklch(0.9 0.01 240)",
  input: "oklch(0.9 0.01 240)",
  ring: "oklch(0.5 0.15 240)",

  // Background scales
  background0: "oklch(1 0 0)",
  background50: "oklch(0.98 0.002 240)",
  background100: "oklch(0.95 0.01 240)",
  background200: "oklch(0.92 0.02 240)",
  background300: "oklch(0.88 0.03 240)",
  background400: "oklch(0.82 0.05 240)",
  background500: "oklch(0.72 0.08 240)",
  background600: "oklch(0.62 0.12 240)",
  background700: "oklch(0.52 0.15 240)",
  background800: "oklch(0.35 0.12 240)",
  background900: "oklch(0.15 0.01 240)",

  // Foreground scales
  foreground0: "oklch(0.15 0.01 240)",
  foreground50: "oklch(0.25 0.02 240)",
  foreground100: "oklch(0.35 0.03 240)",
  foreground200: "oklch(0.45 0.05 240)",
  foreground300: "oklch(0.55 0.08 240)",
  foreground400: "oklch(0.65 0.1 240)",
  foreground500: "oklch(0.72 0.12 240)",
  foreground600: "oklch(0.78 0.1 240)",
  foreground700: "oklch(0.85 0.08 240)",
  foreground800: "oklch(0.92 0.05 240)",
  foreground900: "oklch(0.98 0.002 240)",

  // Primary scales (Ocean Blue)
  primary0: "oklch(0.25 0.15 240)",
  primary50: "oklch(0.35 0.16 240)",
  primary100: "oklch(0.45 0.18 240)",
  primary200: "oklch(0.55 0.2 240)",
  primary300: "oklch(0.65 0.18 240)",
  primary400: "oklch(0.72 0.16 240)",
  primary500: "oklch(0.78 0.14 240)",
  primary600: "oklch(0.82 0.12 240)",
  primary700: "oklch(0.86 0.1 240)",
  primary800: "oklch(0.9 0.08 240)",
  primary900: "oklch(0.95 0.05 240)",

  // Success scales (Ocean Green)
  success0: "oklch(0.25 0.12 160)",
  success50: "oklch(0.35 0.14 160)",
  success100: "oklch(0.45 0.16 160)",
  success200: "oklch(0.55 0.18 160)",
  success300: "oklch(0.65 0.2 160)",
  success400: "oklch(0.72 0.18 160)",
  success500: "oklch(0.78 0.16 160)",
  success600: "oklch(0.82 0.14 160)",
  success700: "oklch(0.86 0.12 160)",
  success800: "oklch(0.9 0.1 160)",
  success900: "oklch(0.95 0.08 160)",

  // Warning scales (Ocean Amber)
  warning0: "oklch(0.4 0.15 85)",
  warning50: "oklch(0.5 0.17 85)",
  warning100: "oklch(0.6 0.19 85)",
  warning200: "oklch(0.7 0.21 85)",
  warning300: "oklch(0.75 0.2 85)",
  warning400: "oklch(0.8 0.18 85)",
  warning500: "oklch(0.82 0.16 85)",
  warning600: "oklch(0.84 0.14 85)",
  warning700: "oklch(0.86 0.12 85)",
  warning800: "oklch(0.88 0.1 85)",
  warning900: "oklch(0.9 0.08 85)",

  // Error scales (Ocean Red)
  error0: "oklch(0.35 0.18 25)",
  error50: "oklch(0.45 0.2 25)",
  error100: "oklch(0.55 0.22 25)",
  error200: "oklch(0.6 0.2 25)",
  error300: "oklch(0.65 0.18 25)",
  error400: "oklch(0.7 0.16 25)",
  error500: "oklch(0.75 0.14 25)",
  error600: "oklch(0.8 0.12 25)",
  error700: "oklch(0.85 0.1 25)",
  error800: "oklch(0.9 0.08 25)",
  error900: "oklch(0.95 0.06 25)",
};

// Example: Forest theme
export const forestTheme: ThemeColors = {
  // Core semantic colors
  background: "oklch(0.97 0.01 120)",
  foreground: "oklch(0.2 0.02 120)",
  card: "oklch(0.99 0.005 120)",
  cardForeground: "oklch(0.2 0.02 120)",
  popover: "oklch(0.99 0.005 120)",
  popoverForeground: "oklch(0.2 0.02 120)",
  primary: "oklch(0.4 0.15 140)",
  primaryForeground: "oklch(0.97 0.01 120)",
  secondary: "oklch(0.93 0.02 120)",
  secondaryForeground: "oklch(0.3 0.02 120)",
  muted: "oklch(0.93 0.02 120)",
  mutedForeground: "oklch(0.55 0.03 120)",
  accent: "oklch(0.9 0.03 120)",
  accentForeground: "oklch(0.3 0.02 120)",
  destructive: "oklch(0.58 0.22 25)",
  destructiveForeground: "oklch(0.97 0.01 120)",
  border: "oklch(0.88 0.02 120)",
  input: "oklch(0.88 0.02 120)",
  ring: "oklch(0.5 0.12 140)",

  // Background scales (Forest theme)
  background0: "oklch(0.99 0.005 120)",
  background50: "oklch(0.97 0.01 120)",
  background100: "oklch(0.93 0.02 120)",
  background200: "oklch(0.88 0.03 120)",
  background300: "oklch(0.82 0.05 120)",
  background400: "oklch(0.75 0.07 120)",
  background500: "oklch(0.65 0.1 120)",
  background600: "oklch(0.55 0.12 120)",
  background700: "oklch(0.45 0.13 120)",
  background800: "oklch(0.3 0.08 120)",
  background900: "oklch(0.2 0.02 120)",

  // Foreground scales
  foreground0: "oklch(0.2 0.02 120)",
  foreground50: "oklch(0.3 0.03 120)",
  foreground100: "oklch(0.4 0.05 120)",
  foreground200: "oklch(0.5 0.07 120)",
  foreground300: "oklch(0.6 0.09 120)",
  foreground400: "oklch(0.68 0.1 120)",
  foreground500: "oklch(0.75 0.08 120)",
  foreground600: "oklch(0.8 0.06 120)",
  foreground700: "oklch(0.85 0.05 120)",
  foreground800: "oklch(0.9 0.03 120)",
  foreground900: "oklch(0.97 0.01 120)",

  // Primary scales (Forest Green)
  primary0: "oklch(0.25 0.12 140)",
  primary50: "oklch(0.35 0.14 140)",
  primary100: "oklch(0.4 0.15 140)",
  primary200: "oklch(0.5 0.16 140)",
  primary300: "oklch(0.6 0.15 140)",
  primary400: "oklch(0.68 0.14 140)",
  primary500: "oklch(0.75 0.12 140)",
  primary600: "oklch(0.8 0.1 140)",
  primary700: "oklch(0.85 0.08 140)",
  primary800: "oklch(0.9 0.06 140)",
  primary900: "oklch(0.95 0.04 140)",

  // Success scales
  success0: "oklch(0.3 0.1 160)",
  success50: "oklch(0.4 0.12 160)",
  success100: "oklch(0.5 0.14 160)",
  success200: "oklch(0.6 0.16 160)",
  success300: "oklch(0.68 0.15 160)",
  success400: "oklch(0.75 0.14 160)",
  success500: "oklch(0.8 0.12 160)",
  success600: "oklch(0.84 0.1 160)",
  success700: "oklch(0.88 0.08 160)",
  success800: "oklch(0.92 0.06 160)",
  success900: "oklch(0.96 0.04 160)",

  // Warning scales
  warning0: "oklch(0.45 0.12 80)",
  warning50: "oklch(0.55 0.14 80)",
  warning100: "oklch(0.65 0.16 80)",
  warning200: "oklch(0.72 0.15 80)",
  warning300: "oklch(0.78 0.14 80)",
  warning400: "oklch(0.82 0.12 80)",
  warning500: "oklch(0.86 0.1 80)",
  warning600: "oklch(0.88 0.08 80)",
  warning700: "oklch(0.9 0.06 80)",
  warning800: "oklch(0.92 0.05 80)",
  warning900: "oklch(0.94 0.04 80)",

  // Error scales
  error0: "oklch(0.4 0.18 25)",
  error50: "oklch(0.5 0.2 25)",
  error100: "oklch(0.58 0.22 25)",
  error200: "oklch(0.65 0.2 25)",
  error300: "oklch(0.7 0.18 25)",
  error400: "oklch(0.75 0.16 25)",
  error500: "oklch(0.8 0.14 25)",
  error600: "oklch(0.84 0.12 25)",
  error700: "oklch(0.88 0.1 25)",
  error800: "oklch(0.92 0.08 25)",
  error900: "oklch(0.96 0.06 25)",
};

// Function to apply a custom theme
export const applyCustomTheme = (
  themeName: string,
  colors: ThemeColors,
) => {
  const root = document.documentElement;

  // Remove existing theme classes
  root.classList.remove("light", "dark", "ocean", "forest");

  // Add new theme class
  root.classList.add(themeName);

  // Apply CSS custom properties
  const cssVars: Record<string, string> = {
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--card": colors.card,
    "--card-foreground": colors.cardForeground,
    "--popover": colors.popover,
    "--popover-foreground": colors.popoverForeground,
    "--primary": colors.primary,
    "--primary-foreground": colors.primaryForeground,
    "--secondary": colors.secondary,
    "--secondary-foreground": colors.secondaryForeground,
    "--muted": colors.muted,
    "--muted-foreground": colors.mutedForeground,
    "--accent": colors.accent,
    "--accent-foreground": colors.accentForeground,
    "--destructive": colors.destructive,
    "--destructive-foreground": colors.destructiveForeground,
    "--border": colors.border,
    "--input": colors.input,
    "--ring": colors.ring,

    // Background scales
    "--background-0": colors.background0,
    "--background-50": colors.background50,
    "--background-100": colors.background100,
    "--background-200": colors.background200,
    "--background-300": colors.background300,
    "--background-400": colors.background400,
    "--background-500": colors.background500,
    "--background-600": colors.background600,
    "--background-700": colors.background700,
    "--background-800": colors.background800,
    "--background-900": colors.background900,

    // Foreground scales
    "--foreground-0": colors.foreground0,
    "--foreground-50": colors.foreground50,
    "--foreground-100": colors.foreground100,
    "--foreground-200": colors.foreground200,
    "--foreground-300": colors.foreground300,
    "--foreground-400": colors.foreground400,
    "--foreground-500": colors.foreground500,
    "--foreground-600": colors.foreground600,
    "--foreground-700": colors.foreground700,
    "--foreground-800": colors.foreground800,
    "--foreground-900": colors.foreground900,

    // Primary scales
    "--primary-0": colors.primary0,
    "--primary-50": colors.primary50,
    "--primary-100": colors.primary100,
    "--primary-200": colors.primary200,
    "--primary-300": colors.primary300,
    "--primary-400": colors.primary400,
    "--primary-500": colors.primary500,
    "--primary-600": colors.primary600,
    "--primary-700": colors.primary700,
    "--primary-800": colors.primary800,
    "--primary-900": colors.primary900,

    // Success scales
    "--success-0": colors.success0,
    "--success-50": colors.success50,
    "--success-100": colors.success100,
    "--success-200": colors.success200,
    "--success-300": colors.success300,
    "--success-400": colors.success400,
    "--success-500": colors.success500,
    "--success-600": colors.success600,
    "--success-700": colors.success700,
    "--success-800": colors.success800,
    "--success-900": colors.success900,

    // Warning scales
    "--warning-0": colors.warning0,
    "--warning-50": colors.warning50,
    "--warning-100": colors.warning100,
    "--warning-200": colors.warning200,
    "--warning-300": colors.warning300,
    "--warning-400": colors.warning400,
    "--warning-500": colors.warning500,
    "--warning-600": colors.warning600,
    "--warning-700": colors.warning700,
    "--warning-800": colors.warning800,
    "--warning-900": colors.warning900,

    // Error scales
    "--error-0": colors.error0,
    "--error-50": colors.error50,
    "--error-100": colors.error100,
    "--error-200": colors.error200,
    "--error-300": colors.error300,
    "--error-400": colors.error400,
    "--error-500": colors.error500,
    "--error-600": colors.error600,
    "--error-700": colors.error700,
    "--error-800": colors.error800,
    "--error-900": colors.error900,
  };

  // Apply all CSS variables
  Object.entries(cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

// Available themes
export const themes = {
  light: "light",
  dark: "dark",
  ocean: "ocean",
  forest: "forest",
} as const;

export type ThemeName = keyof typeof themes;
